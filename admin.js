(() => {
  const client = window.aeromedSupabase;
  const loginForm = document.getElementById("login-form");
  const configWarning = document.getElementById("admin-config-warning");
  const loginStatus = document.getElementById("login-status");
  const uploadStatus = document.getElementById("upload-status");
  const uploadPanel = document.getElementById("upload-panel");
  const uploadForm = document.getElementById("upload-form");
  const adminList = document.getElementById("admin-document-list");
  const bucket = "aeromed-documents";
  const maxBytes = 25 * 1024 * 1024;
  const allowedExtensions = new Set(["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "png", "jpg", "jpeg"]);
  const mimeByExtension = { pdf: "application/pdf", doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ppt: "application/vnd.ms-powerpoint", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation", xls: "application/vnd.ms-excel", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", txt: "text/plain", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg" };
  const $ = id => document.getElementById(id);

  if (!client) {
    configWarning.hidden = false;
    loginForm.querySelectorAll("input,button").forEach(control => control.disabled = true);
    return;
  }

  function status(element, message, isError = false) {
    element.textContent = message;
    element.classList.toggle("is-error", isError);
  }

  async function isAdmin(userId) {
    const { data, error } = await client.from("aeromed_admins").select("user_id").eq("user_id", userId).maybeSingle();
    return !error && Boolean(data);
  }

  function showPanel() {
    loginForm.hidden = true;
    uploadPanel.hidden = false;
    loginStatus.textContent = "Signed in as an AeroMed administrator.";
    loadAdminDocuments();
  }

  async function loadAdminDocuments() {
    const { data, error } = await client.storage.from(bucket).list("", { limit: 100, sortBy: { column: "name", order: "desc" } });
    adminList.replaceChildren();
    if (error) {
      status(uploadStatus, "Could not load the document list. Check the storage policies.", true);
      return;
    }
    const files = (data || []).filter(item => item.name && item.id);
    if (!files.length) {
      adminList.textContent = "No documents uploaded yet.";
      return;
    }
    for (const file of files) {
      const li = document.createElement("li");
      const name = document.createElement("span");
      const remove = document.createElement("button");
      name.textContent = file.name.replace(/^\d+-/, "");
      remove.type = "button";
      remove.className = "document-delete";
      remove.textContent = "Remove";
      remove.addEventListener("click", async () => {
        remove.disabled = true;
        const { error: deleteError } = await client.storage.from(bucket).remove([file.name]);
        if (deleteError) {
          status(uploadStatus, "The file could not be removed. Please try again.", true);
          remove.disabled = false;
          return;
        }
        status(uploadStatus, "Document removed.");
        loadAdminDocuments();
      });
      li.append(name, remove);
      adminList.append(li);
    }
  }

  loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    const button = $("login-button");
    button.disabled = true;
    status(loginStatus, "Signing in…");
    const { data, error } = await client.auth.signInWithPassword({
      email: $("email").value.trim(),
      password: $("password").value
    });
    button.disabled = false;
    if (error) {
      status(loginStatus, "Sign-in failed. Check your email and password, and confirm the account is enabled.", true);
      return;
    }
    if (!(await isAdmin(data.user.id))) {
      await client.auth.signOut();
      status(loginStatus, "This account is not authorized as an AeroMed administrator.", true);
      return;
    }
    showPanel();
  });

  uploadForm.addEventListener("submit", async event => {
    event.preventDefault();
    const input = $("documents");
    const files = Array.from(input.files || []);
    if (!files.length) {
      status(uploadStatus, "Choose one or more files first.", true);
      return;
    }
    const button = $("upload-button");
    button.disabled = true;
    let uploaded = 0;
    for (const file of files) {
      const extension = file.name.split(".").pop().toLowerCase();
      if (!allowedExtensions.has(extension)) {
        status(uploadStatus, `${file.name}: file type is not allowed.`, true);
        continue;
      }
      if (file.size > maxBytes) {
        status(uploadStatus, `${file.name}: file exceeds the 25 MB limit.`, true);
        continue;
      }
      const safeName = file.name.replace(/[^A-Za-z0-9._ -]/g, "_");
      const path = `${Date.now()}-${uploaded}-${safeName}`;
      const { error } = await client.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || mimeByExtension[extension]
      });
      if (error) {
        status(uploadStatus, `${file.name} could not be uploaded. Check storage settings and try again.`, true);
        continue;
      }
      uploaded += 1;
    }
    button.disabled = false;
    input.value = "";
    if (uploaded) status(uploadStatus, `${uploaded} document${uploaded === 1 ? "" : "s"} uploaded and published.`);
    loadAdminDocuments();
  });

  $("signout-button").addEventListener("click", async () => {
    await client.auth.signOut();
    uploadPanel.hidden = true;
    loginForm.hidden = false;
    status(loginStatus, "You are signed out.");
  });

  client.auth.getSession().then(async ({ data }) => {
    if (data.session && await isAdmin(data.session.user.id)) showPanel();
  });
})();
