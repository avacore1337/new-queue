export function downloadFile(fileName: string, fileContent: string): void {

    function fakeClick(obj: any): void {
      const ev = document.createEvent("MouseEvents");
      ev.initMouseEvent(
        "click",
        true,
        false,
        window,
        0,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null
      );
      obj.dispatchEvent(ev);
    }

    function exportRaw(name: string, data: string): void {
      let urlObject = window.URL || window.webkitURL || window;
      let export_blob = new Blob([data]);

      if ('msSaveBlob' in navigator) {
        // Prefer msSaveBlob if available - Edge supports a[download] but
        // ignores the filename provided, using the blob UUID instead.
        // msSaveBlob will respect the provided filename
        navigator.msSaveBlob(export_blob, name);
      } else if ('download' in HTMLAnchorElement.prototype) {
        const saveLink = document.createElementNS(
          "http://www.w3.org/1999/xhtml",
          "a"
        ) as HTMLAnchorElement;
        saveLink.href = urlObject.createObjectURL(export_blob);
        saveLink.download = name;
        fakeClick(saveLink);
      } else {
        throw new Error("Neither a[download] nor msSaveBlob is available");
      }
    }
    exportRaw(fileName, fileContent);
  }

export function copyToClipboard(content: string): void {
  const element = document.createElement('textarea');
  element.value = content;
  element.setAttribute('readonly', '');
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  document.body.appendChild(element);
  element.select();
  document.execCommand('copy');
  document.body.removeChild(element);
}

export function addFlashCard(message: string): void {

  const body = document.querySelector('body');
  if (body === null) {
    return;
  }

  const flashCard = document.createElement("div");
  flashCard.className = "flash-card";
  flashCard.appendChild(document.createTextNode(message));

  body.appendChild(flashCard);
  flashCard.addEventListener('webkitAnimationEnd', () => {
    body.removeChild(flashCard);
  }, false);
}
