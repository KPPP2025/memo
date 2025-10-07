document.addEventListener("DOMContentLoaded", () => {
  
  const languageSelect = document.getElementById("languageSelect");
  if (languageSelect) {
    languageSelect.addEventListener("change", () => {
      const selectedLanguage = languageSelect.value;
      if (selectedLanguage) {
        localStorage.setItem("selectedLanguage", selectedLanguage);
        window.location.href = "practise.html";
      }
    });
  }

  
  const languageDisplay = document.getElementById("languageDisplay");
  const selectedLanguage = localStorage.getItem("selectedLanguage");
  if (languageDisplay && selectedLanguage) {
    languageDisplay.textContent = `You are practising ${selectedLanguage}!`;
  }

  const fileSelect = document.getElementById("fileSelect");
  const flashcard = document.getElementById("flashCard");
  const front = document.querySelector(".front");
  const back = document.querySelector(".back");
  const nextBtn = document.getElementById("nexBtn"); 
  const preBtn = document.getElementById("preBtn");
  const showBtn = document.getElementById("showBtn");
  const autoModeBtn = document.getElementById("autoMode");
  const manualModeBtn = document.getElementById("manualMode");

  let flashCardsData = JSON.parse(localStorage.getItem(`flashCardsByFiles_${selectedLanguage}`) || "{}");
  let currentFile = null;
  let flashCards = [];
  let currentIndex = 0;
  let autoInterval = null;

  let currentMode = localStorage.getItem("practiseMode") || "auto";
  updateModeUI(currentMode);

  
  if (currentMode === "auto" && nextBtn) {
    clearInterval(autoInterval);
    autoInterval = setInterval(() => {
      nextBtn.click();
    }, 3000);
  }

  if (autoModeBtn && manualModeBtn) {
    autoModeBtn.addEventListener("click", () => {
      currentMode = "auto";
      localStorage.setItem("practiseMode", currentMode);
      updateModeUI(currentMode);

      clearInterval(autoInterval);
      autoInterval = setInterval(() => {
        nextBtn.click();
      }, 3000);
    });

    manualModeBtn.addEventListener("click", () => {
      currentMode = "manual";
      localStorage.setItem("practiseMode", currentMode);
      updateModeUI(currentMode);

      clearInterval(autoInterval);
    });
  }

  function updateModeUI(mode) {
    if (mode === "auto") {
      autoModeBtn.classList.add("active");
      manualModeBtn.classList.remove("active");
    } else {
      manualModeBtn.classList.add("active");
      autoModeBtn.classList.remove("active");
    }
  }

 
  if (fileSelect) {
    const fileNames = Object.keys(flashCardsData);
    fileNames.reverse();
    fileNames.forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      fileSelect.appendChild(option);
    });

    if (fileNames.length > 0) {
      currentFile = fileNames[0];
      fileSelect.value = currentFile;
      flashCards = flashCardsData[currentFile] || [];
      showFlashCard();
    }

    fileSelect.addEventListener("change", () => {
      currentFile = fileSelect.value;
      flashCards = flashCardsData[currentFile] || [];
      currentIndex = 0;
      showFlashCard();
    });

    function showFlashCard() {
      if (flashCards.length === 0) {
        front.textContent = "No cards yet";
        back.textContent = "";
        return;
      }
      const card = flashCards[currentIndex];
      front.textContent = card.front;
      back.textContent = card.back;
      flashcard.classList.remove("flipped");
    }

    preBtn.addEventListener("click", () => {
      if (flashCards.length > 0) {
        currentIndex = (currentIndex - 1 + flashCards.length) % flashCards.length;
        showFlashCard();
      }
    });

    nextBtn.addEventListener("click", () => {
      if (flashCards.length > 0) {
        currentIndex = (currentIndex + 1 + flashCards.length) % flashCards.length;
        showFlashCard();
      }
    });

    showBtn.addEventListener("click", () => {
      flashcard.classList.toggle("flipped");
      let flipped = JSON.parse(localStorage.getItem("flippedCards") || "{}");

      if (!flipped[currentFile]) flipped[currentFile] = [];
      const word = flashCards[currentIndex];
      if (!flipped[currentFile].some((c) => c.front === word.front)) {
        flipped[currentFile].push(word);
      }
      localStorage.setItem("flippedCards", JSON.stringify(flipped));
    });
  }

  const addCardBtn = document.getElementById("addCardsBtn");
  if (addCardBtn) {
    addCardBtn.addEventListener("click", () => {
      window.location.href = "addCards.html";
    });
  }

  const changeLanguageBtn = document.getElementById("changeLanguageBtn");
  if (changeLanguageBtn) {
    changeLanguageBtn.addEventListener("click", () => {
      localStorage.removeItem("selectedLanguage");
      window.location.href = "index.html";
    });
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const fileSelectAdd = document.getElementById("fileName");
  const saveCardBtn = document.getElementById("saveCardBtn");
  const backToPractiseBtn = document.getElementById("backToPractiseBtn");
  const fileSuggestions = document.getElementById("fileSuggestion");
  const messageBox = document.getElementById("messageBox");
  const cardList = document.getElementById("cardList");

  const selectedLanguage = localStorage.getItem("selectedLanguage") || "Default";
  let flashCardsByFiles = JSON.parse(localStorage.getItem(`flashCardsByFiles_${selectedLanguage}`) || "{}");

  function populateDatalist() {
    if (!fileSuggestions) return;
    fileSuggestions.innerHTML = "";
    Object.keys(flashCardsByFiles).forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      fileSuggestions.appendChild(option);
    });
  }
  populateDatalist();

  if (fileSelectAdd) {
    fileSelectAdd.addEventListener("focus", function () {
      this.dataset.prev = this.value || "";
      setTimeout(() => {
        this.value = "";
      }, 0);
    });

    fileSelectAdd.addEventListener("blur", function () {
      if (!this.value && this.dataset.prev) {
        this.value = this.dataset.prev;
      }
      delete this.dataset.prev;
    });

    fileSelectAdd.addEventListener("input", () => {
      const selectedFile = fileSelectAdd.value.trim();
      if (selectedFile) displayCards(selectedFile);
      else if (cardList) cardList.innerHTML = "";
    });
  }

  if (saveCardBtn) {
    const frontInput = document.getElementById("frontText");
    const backInput = document.getElementById("backText");

    saveCardBtn.addEventListener("click", () => {
      const fileName = (fileSelectAdd && fileSelectAdd.value || "").trim();
      const front = frontInput.value.trim();
      const back = backInput.value.trim();

      if (!fileName || !front || !back) {
        showMessage("Please fill all fields!", "error");
        saveCardBtn.classList.add("shake");
        setTimeout(() => saveCardBtn.classList.remove("shake"), 300);
        return;
      }

      if (!flashCardsByFiles[fileName]) flashCardsByFiles[fileName] = [];
      flashCardsByFiles[fileName].push({ front, back });

      localStorage.setItem(`flashCardsByFiles_${selectedLanguage}`, JSON.stringify(flashCardsByFiles));

      populateDatalist();
      fileSelectAdd.value = fileName;
      frontInput.value = "";
      backInput.value = "";
      frontInput.focus();
      showMessage("Card Saved!", "success");
      displayCards(fileName);
    });
  }

  if (backToPractiseBtn) {
    backToPractiseBtn.addEventListener("click", () => {
      window.location.href = "practise.html";
    });
  }

  function showMessage(message, type) {
    if (!messageBox) return;
    messageBox.textContent = message;
    messageBox.className = type;
    messageBox.style.opacity = "1";
    setTimeout(() => (messageBox.style.opacity = "0"), 2000);
  }

  function displayCards(fileName) {
    if (!cardList) return;
    cardList.innerHTML = "";
    const cards = flashCardsByFiles[fileName] || [];
    cards.forEach((card, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${card.front}</strong> - ${card.back}
        <button class="deleteBtn">🗑️</button>
      `;
      li.querySelector(".deleteBtn").addEventListener("click", () => {
        if (confirm("Delete this card?")) {
          flashCardsByFiles[fileName].splice(index, 1);
          localStorage.setItem(`flashCardsByFiles_${selectedLanguage}`, JSON.stringify(flashCardsByFiles));
          populateDatalist();
          displayCards(fileName);
          showMessage("Card deleted!", "success");
        }
      });
      cardList.appendChild(li);
    });
  }
});
