(() => {
  const status = document.getElementById("library-status");
  const list = document.getElementById("document-list");
  const client = window.aeromedSupabase;
  const bucket = "aeromed-documents";

  function showMessage(message) {
    status.textContent = message;
  }

  function addDocument(item) {
    const url = client.storage.from(bucket).getPublicUrl(item.name).data.publicUrl;
    const li = document.createElement("li");
    const link = document.createElement("a");
    const info = document.createElement("span");
    const name = document.createElement("strong");
    const size = document.createElement("small");
    name.textContent = item.name.replace(/^\d+-/, "");
    size.textContent = item.metadata?.size ? `${Math.ceil(item.metadata.size / 1024)} KB` : "Learning resource";
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.append(name, document.createTextNode(" ↗"));
    info.append(link, size);
    li.append(info);
    list.append(li);
  }

  async function loadDocuments() {
    if (!client) {
      showMessage("The document library is not connected yet. The site administrator needs to finish the storage setup.");
      return;
    }
    const { data, error } = await client.storage.from(bucket).list("", { limit: 100, sortBy: { column: "name", order: "desc" } });
    if (error) {
      showMessage("Documents could not be loaded. Please try again later.");
      return;
    }
    list.replaceChildren();
    const files = (data || []).filter(item => item.name && item.id);
    if (!files.length) {
      showMessage("No documents have been added yet.");
      return;
    }
    showMessage(`${files.length} document${files.length === 1 ? "" : "s"} available`);
    files.forEach(addDocument);
  }

  loadDocuments();
})();
