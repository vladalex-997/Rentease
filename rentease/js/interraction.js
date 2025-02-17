function showInteractionWindow(message) {
  const interactionWindow = document.createElement("div");
  const windowContent = document.createElement("div");
  const messageParagraph = document.createElement("p");
  const closeButton = document.createElement("button");

  interactionWindow.classList.add("interaction-window");
  windowContent.classList.add("interaction-window-content");
  messageParagraph.textContent = message;
  closeButton.textContent = "Close";

  windowContent.appendChild(messageParagraph);
  windowContent.appendChild(closeButton);
  interactionWindow.appendChild(windowContent);
  document.body.appendChild(interactionWindow);

  closeButton.addEventListener("click", () => {
    interactionWindow.classList.add("close");
    setTimeout(() => {
      interactionWindow.remove();
    }, 300);
  });

  setTimeout(() => {
    interactionWindow.classList.add("close");
    setTimeout(() => {
      interactionWindow.remove();
    }, 300);
  }, 2000);
}
