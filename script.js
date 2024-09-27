class App {
  constructor() {
    this.searchBtn = document.querySelector(".search__button");
    this.closeFormBtn = document.querySelector(".form__close--btn");
    this.newItemForm = document.querySelector(".form");
    this.locationInput = document.querySelector(".location__input");
    this.nameInput = document.querySelector(".name__input");
    this.itemList = document.querySelector(".item__list");
    this.notesInput = document.querySelector(".notes__input");
    this.addItem = document.querySelector(".btn__create");
    this.closeEmojiBtn = document.querySelector(".emoji__close--btn");
    this.emojiContainer = document.querySelector(".emoji__suggestions");
    this.emojiPicker = document.querySelector(".name__icon--container");
    this.emojiPickerIcon = document.querySelector(".name__icon");
    this.iconList = document.querySelector(".emoji__list");
    this.doneBtn = document.querySelector(".done__btn");
    this.itemList = document.querySelector(".item__list");
    this.overlay = document.querySelector(".overlay");
    this.bookmarksIcon = document.querySelector("bookmarks__icon");
    this.itemInformation = document.querySelector(".item__information");
    this.item = document.querySelector(".item");
    this.doneBtn = document.querySelector(".done--btn");
    this.searchbar = document.querySelector(".bar");
    this.resetBtn = document.querySelector(".reset__btn");
    this.deleteBtn = document.querySelector(".delete__btn");
    this.logoContainer = document.querySelector(".logo__container");
    this.editBtn = document.querySelector(".edit__btn");
    this.bookmarksContainer = document.querySelector(".bookmarks__container");
    this.bookmarksDisplay = document.querySelector(".bookmarks__display");
    this.bookmarksIcon = document.querySelector(".bookmarks__icon");
    this.bookmarkBtn = document.querySelector(".bookmark__btn");
    this.mark = document.querySelector(".mark");
    this.bookmarkIconFilled = document.querySelector(
      ".bookmarks__icon--filled"
    );
    this.bookmarkIconOutline = document.querySelector(
      ".bookmarks__icon--outline"
    );

    // Current state trackers
    this.currInformationDisplay;
    this.currIconPicked = null;
    this.currIcons = [];
    this.currItems = [];
    this.currBookmarked = [];
    this.isBookmarked = false;

    this.initEventListeners();
    this.setupBookmarksStyles();
    this.emptyBookmarkDisplay();
  }

  initEventListeners() {
    this.mark.addEventListener("mouseover", () => this.displayBookmarks());
    this.searchBtn.addEventListener("click", (e) => this.searchItems(e));
    this.addItem.addEventListener("click", () => this.handleAddItem());
    this.closeFormBtn.addEventListener("click", () => this.hideForm());
    this.closeEmojiBtn.addEventListener("click", () =>
      this.toggleEmojiContainer()
    );
    this.emojiPicker.addEventListener("click", (e) =>
      this.handleEmojiPickerClick(e)
    );
    this.nameInput.addEventListener("keydown", (e) =>
      this.handleNameInputEnter(e)
    );
    this.newItemForm.addEventListener("submit", (e) => e.preventDefault());
    document.addEventListener("keydown", (e) => this.escapeWindow(e));
    this.itemList.addEventListener("click", (e) => this.renderInformation(e));
    this.itemInformation.addEventListener("click", (e) =>
      this.handleAddBookmark(e)
    );
    this.bookmarksDisplay.addEventListener("click", (e) =>
      this.renderInformation(e)
    );
    this.doneBtn.addEventListener("click", (e) => this.handleFormSubmit(e));
    window.addEventListener("load", () => this.loadCurrBookmarksFromStorage());
    window.addEventListener("load", () => this.loadItemsFromStorage());
    window.addEventListener("load", () => this.loadInformationFromStorage());
    window.addEventListener("load", () => this.loadCurrIconFromStorage());
    this.resetBtn.addEventListener("click", () => this.resetItems());
    this.itemList.addEventListener("click", (e) => this.deleteItem(e));
    this.logoContainer.addEventListener("click", (e) => this.logoClick(e));
    this.searchbar.addEventListener("keydown", (e) =>
      this.handleSearchbarEnter(e)
    );
    this.searchbar.addEventListener("input", (e) =>
      this.searchbarFocusStore(e)
    );
    window.addEventListener("load", () => this.searchbarFocus());
    this.itemInformation.addEventListener("click", (e) => this.editItem(e));
    this.bookmarksContainer.addEventListener("mouseenter", () =>
      this.displayBookmarks()
    );
    this.bookmarksDisplay.addEventListener("mouseleave", () =>
      this.hideBookmarks()
    );
  }

  searchbarFocus() {
    // Focus the search bar after page reload
    // Clean up the flag
    if (sessionStorage.getItem("shouldFocusSearchbar") === "true") {
      this.searchbar.focus();
      sessionStorage.removeItem("shouldFocusSearchbar");
    }
  }

  searchbarFocusStore(e) {
    // Set a flag to focus the search bar after reload
    if (this.searchbar.value === "") {
      sessionStorage.setItem("shouldFocusSearchbar", "true");
      window.location.reload();
    }
  }

  handleSearchbarEnter(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      this.searchItems(e);
    }
  }

  handleAddBookmark(e) {
    const btn = e.target.closest(".bookmark__btn");
    const solid = e.target.closest(".bookmark__solid");
    console.log(solid);

    // Creating a new bookmark
    if (!solid && btn) {
      const empty = document.querySelector('.empty__bookmarks');
      if (empty) this.bookmarksDisplay.innerHTML = '';

      btn.classList.add("hidden");
      const html = `<div class="bookmark__solid"></div>`;
      this.itemInformation.insertAdjacentHTML("beforeend", html);
      const target = this.currItems.find(
        (item) => item.name === this.currInformationDisplay.name
      );
      console.log("Target:");
      console.log(target);
      // ???
      if (this.currBookmarked.includes(target)) return;
      this.currBookmarked.push(target);
      this.saveBookmarksToStorage();
    } else if (solid) {
      // Deleting a bookmark
      const html = `<div class="bookmark__btn">
            <div class="bookmark bookmarks__icon--outline"></div>
            <div class="bookmark bookmarks__icon--filled mark"></div>
          </div>`;
      const target = this.currItems.find(
        (item) => item.name === this.currInformationDisplay.name
      );
      this.currBookmarked = this.currBookmarked.filter(
        (item) => item.name !== target.name
      );
      this.saveBookmarksToStorage();
      this.itemInformation.insertAdjacentHTML("beforeend", html);
      solid.remove();

      // Remove the unbookmarked item from the bookmarks display
      this.removeBookmarkFromDisplay(target.name);
      this.emptyBookmarkDisplay();
    }
    if (!btn) return;
    const name = this.currInformationDisplay.name;
    const target = this.currItems.find((item) => item.name === name);
    this.renderBookmarkItem(target);
  }

  handleNameInputEnter(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      // Trigger the emoji picker when Enter is pressed
      this.handleEmojiPickerClick(e);
    }
  }

  handleAddItem() {
    this.clearFormInput();
    this.showForm();
  }

  removeBookmarkFromDisplay(itemName) {
    const bookmarkItems = this.bookmarksDisplay.querySelectorAll(".item");
    bookmarkItems.forEach((item) => {
      const nameElement = item.querySelector(".item__name");
      if (nameElement && nameElement.textContent === itemName) {
        item.remove();
      }
    });
  }

  setupBookmarksStyles() {
    // Add these styles to your bookmarks display element
    this.bookmarksDisplay.classList.add("hidden");
    this.bookmarksDisplay.style.transition = "opacity 0.3s ease-out";
    this.bookmarksDisplay.style.opacity = "0";
    this.bookmarksDisplay.style.pointerEvents = "none";
  }

  displayBookmarks() {
    this.bookmarksDisplay.style.opacity = "1";
    this.bookmarksDisplay.classList.add("flex");
    this.bookmarksDisplay.style.pointerEvents = "auto";
  }

  hideBookmarks() {
    this.bookmarksDisplay.style.opacity = "0";

    this.bookmarksDisplay.style.pointerEvents = "none";
  }

  editItem(e) {
    e.preventDefault();
    const btn = e.target.closest(".edit__btn");
    if (!btn) return;

    console.log("yay");
    this.nameInput.value = this.currInformationDisplay.name;
    this.locationInput.value = this.currInformationDisplay.location;
    this.notesInput.value = this.currInformationDisplay.notes;
    this.showForm();
    this.currIconPicked = this.currInformationDisplay.url
      .slice(0, -6)
      .concat("FFFFFF");
    this.doneBtn.addEventListener("click", () => {
      console.log("hi");

      this.handleFormSubmit(e);
      // console.log(this.currItems);
      // console.log(this.currInformationDisplay);

      this.currItems.forEach((item) => console.log(item.icon));
      // console.log(this.currInformationDisplay.url);

      const iconEdit = this.currInformationDisplay.url.slice(0, -6);
      const white = "FFFFFF";
      const url = iconEdit.concat(white);

      // Deleting original item
      this.currItems = this.currItems.filter(
        (item) =>
          item.name !== this.currInformationDisplay.name ||
          item.location !== this.currInformationDisplay.location ||
          item.notes !== this.currInformationDisplay.notes ||
          item.icon !== url
      );
      this.saveItemsToStorage();

      this.logoClick(e);
    });
  }

  logoClick(e) {
    e.preventDefault();
    // Emptying display
    this.currInformationDisplay = "";
    this.setCurrInformationDisplayToLocalStorage();
    window.location.reload();
  }

  setCurrInformationDisplayToLocalStorage() {
    localStorage.setItem(
      "information",
      JSON.stringify(this.currInformationDisplay)
    );
  }

  // Deleting item (also removes from local storage)
  deleteItem(e) {
    e.preventDefault();
    const item = e.target.closest(".item");
    const name = item.querySelector(".item__name");
    const btn = e.target.closest(".delete__btn");
    if (!btn) return;
    this.currItems = this.currItems.filter(
      (item) => item.name != name.textContent
    );
    console.log(this.currItems);
    this.currInformationDisplay = "";
    this.setCurrInformationDisplayToLocalStorage();
    this.saveItemsToStorage();
    window.location.reload();
  }

  // Search bar
  searchItems(e) {
    e.preventDefault();
    const query = this.searchbar.value;
    const queryLowercase = query.toLowerCase();
    this.itemList.innerHTML = "";

    const queryCategory = this.currItems.filter(
      (item) => item.location.toLowerCase() == queryLowercase
    );
    queryCategory.forEach((item) => this.renderItem(item));

    const queryItems = this.currItems.filter(
      (item) => item.name.toLowerCase() == queryLowercase
    );
    queryItems.forEach((item) => this.renderItem(item));
  }

  // Rendering item information
  renderInformation(e) {
    const res = e.target.closest(".item");
    // Resetting bookmarked fill
    this.isBookmarked = false;
    console.log(res);
    if (!res) return;
    const name = res.querySelector(".item__name").textContent;
    const location = res.querySelector(".item__location").textContent;
    const notes = res.querySelector(".item__notes").textContent;
    const icon = res.querySelector(".item__icon").getAttribute("src");
    const iconEdit = icon.slice(0, -6);
    const black = "000000";
    const url = iconEdit.concat(black);
    this.itemInformation.innerHTML = "";

    this.currBookmarked.forEach((item) => {
      if (item.name === name) {
        this.isBookmarked = true;
      }
    });
    console.log("FLAG");
    console.log(this.isBookmarked);

    const information = {
      name,
      url,
      location,
      notes,
      id: Date.now(),
    };

    this.currInformationDisplay = information;
    localStorage.setItem(
      "information",
      JSON.stringify(this.currInformationDisplay)
    );

    this.displayInformation(information);

    // const html = `<div class="item__information--title">
    //         <h2>${name.textContent}</h2>
    //         <img
    //         class="item__icon"
    //         src=${url}
    //         />
    //       </div>
    //       <p class="location">${location.textContent}</p>
    //       <p>${notes.textContent}</p>
    //     </div>`;
    // this.itemInformation.insertAdjacentHTML("afterbegin", html);
  }

  displayInformation(item) {
    const isBookmarked = this.currBookmarked.some(
      (bookmark) => bookmark.name === item.name
    );
    const html = `<div class="item__information--title">
            <h2>${item.name}</h2>
            <img
            class="item__icon"
            src=${item.url}
            />

          </div>
          <p class="location">${item.location}</p>
          <p>${item.notes}</p>
                                        <button class="edit__btn">
            <svg class="edit__icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24";transform: ;msFilter:;"><path d="m18.988 2.012 3 3L19.701 7.3l-3-3zM8 16h3l7.287-7.287-3-3L8 13z"></path><path d="M19 19H8.158c-.026 0-.053.01-.079.01-.033 0-.066-.009-.1-.01H5V5h6.847l2-2H5c-1.103 0-2 .896-2 2v14c0 1.104.897 2 2 2h14a2 2 0 0 0 2-2v-8.668l-2 2V19z"></path></svg>
          </button>
          ${
            isBookmarked
              ? `<div class="bookmark__solid"></div>`
              : `<div class="bookmark__btn">
            <div class="bookmark bookmarks__icon--outline"></div>
            <div class="bookmark bookmarks__icon--filled mark"></div>
          </div>`
          }
        `;

    this.itemInformation.insertAdjacentHTML("afterbegin", html);

    // Need to reset to 'left' alignment each time
    this.itemInformation.style.textAlign = "left";
    if (item.notes.length < 70) this.itemInformation.style.textAlign = "center";
  }

  renderIcons(currIcons) {
    this.iconList.innerHTML = "";
    currIcons.forEach((icon) => {
      const [lib, iconName] = icon.split(":");
      const html = `<img
          class="suggested__icon"
          src="https://api.iconify.design/${lib}/${iconName}.svg?color=%23FFFFFF"
          />`;
      this.iconList.insertAdjacentHTML("beforeend", html);
    });

    this.iconList.addEventListener("click", (e) => {
      const icon = e.target.closest(".suggested__icon")?.getAttribute("src");
      console.log(icon);
      if (!icon) return;
      console.log(icon);
      const iconEdit = icon.slice(0, -6);
      console.log(iconEdit);
      const black = "000000";
      const result = iconEdit.concat(black);
      console.log(result);

      this.emojiContainer.classList.add("hidden");

      this.renderChosenIcon(result);

      this.currIconPicked = icon;
    });
  }

  async renderChosenIcon(url) {
    try {
      // this.renderSpinner(this.emojiPicker,  true);

      // console.log(this.emojiPickerIcon.src);
      this.emojiPickerIcon.src = url;
      // console.log(this.emojiPickerIcon.src);
    } catch (err) {
      console.log(err);
    }
  }

  async searchIcons(query) {
    try {
      this.renderSpinner(this.iconList, false);
      const response = await fetch(
        `https://api.iconify.design/search?query=${query}`
      );
      const data = await response.json();
      if (data.icons.length === 0) {
        this.iconList.innerHTML = "";
        const html = `
          <div class="no__icons--container">
          <p class="no__icons">No icons found!</p>
          <img
            class="no__icons--icon"
            src="https://api.iconify.design/mingcute/sad-fill.svg?color=%23FFFFFF"
          />
          </div>`;

        this.iconList.insertAdjacentHTML("afterbegin", html);

        // https://api.iconify.design/mingcute/sad-fill.svg?color=%23FFFFFF
      }

      this.currIcons = data.icons;
      if (data.icons.length !== 0) this.renderIcons(this.currIcons);
    } catch (err) {
      console.error(err);
    }
  }

  // Displaying form
  showForm() {
    this.newItemForm.classList.remove("hidden");
    this.nameInput.focus();
    this.overlay.classList.remove("hidden");
  }

  // Hiding form
  hideForm() {
    this.newItemForm.classList.add("hidden");
    if (!this.overlay.classList.contains("hidden"))
      this.overlay.classList.toggle("hidden");
  }
  escapeWindow(e) {
    if (e.key === "Escape") {
      this.nameInput.value,
        this.locationInput.value,
        (this.nameInput.value = "");
      this.hideForm();
    }
  }

  handleFormSubmit(e) {
    e.preventDefault();
    console.log("Form submitted");
    const name = this.nameInput.value;
    const location = this.locationInput.value;
    const notes = this.notesInput.value;

    // Check if necessary fields are not empty
    if (name !== "" && location !== "") {
      // Create the new item object
      const newItem = {
        id: Date.now(), // Use a timestamp as a unique ID
        icon:
          this.currIconPicked ||
          `https://api.iconify.design/mingcute/question-fill.svg?color=%23FFFFFF`,
        name,
        location,
        notes,
      };

      // Add the new item to the current list of items
      this.currItems.push(newItem);

      // Save the updated item list to local storage
      this.saveItemsToStorage();

      // Render the new item on the page
      this.renderItem(newItem);

      this.hideForm();
      this.emojiContainer.classList.add("hidden");

      // Clear input
      this.nameInput.value = "";
      this.locationInput.value = "";
      this.notesInput.value = "";
      // Reset emoji picker icon
      this.emojiPickerIcon.src = `https://api.iconify.design/lucide/smile.svg`;
    }
  }

  renderItem(item) {
    const html = `<div class="item">
    <img class="item__icon"
            src="${item.icon}"/>
          <p class="item__name">${item.name}</p>
          <p class="item__location">${item.location}</p>
          <p class="item__notes hidden">${item.notes}</p>
          <button class="delete__btn">
            <svg class="delete__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 10.5858L14.8284 7.75736L16.2426 9.17157L13.4142 12L16.2426 14.8284L14.8284 16.2426L12 13.4142L9.17157 16.2426L7.75736 14.8284L10.5858 12L7.75736 9.17157L9.17157 7.75736L12 10.5858Z"></path></svg>
          </button>
        </div>`;
    this.itemList.insertAdjacentHTML("afterbegin", html);
  }
  renderBookmarkItem(item) {
    const html = `<div class="item">
    <img class="item__icon"
            src="${item.icon}"/>
          <p class="item__name">${item.name}</p>
          <p class="item__location">${item.location}</p>
          <p class="item__notes hidden">${item.notes}</p>
        </div>`;
    this.bookmarksDisplay.insertAdjacentHTML("afterbegin", html);
  }

  toggleEmojiContainer() {
    this.emojiContainer.classList.toggle("hidden");
  }

  handleEmojiPickerClick(e) {
    // console.log(e.target);
    // this.toggleEmojiContainer();
    if (this.nameInput.value !== "") {
      if (this.emojiContainer.classList.contains("hidden"))
        this.toggleEmojiContainer();
      this.searchIcons(this.nameInput.value.replace(" ", ""));
    }
  }

  // Render loading spinner
  renderSpinner(parentEl, mini) {
    const markup = `<svg class="spinner${
      mini === false ? "" : "__mini"
    }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.9995 2C12.5518 2 12.9995 2.44772 12.9995 3V6C12.9995 6.55228 12.5518 7 11.9995 7C11.4472 7 10.9995 6.55228 10.9995 6V3C10.9995 2.44772 11.4472 2 11.9995 2ZM11.9995 17C12.5518 17 12.9995 17.4477 12.9995 18V21C12.9995 21.5523 12.5518 22 11.9995 22C11.4472 22 10.9995 21.5523 10.9995 21V18C10.9995 17.4477 11.4472 17 11.9995 17ZM20.6597 7C20.9359 7.47829 20.772 8.08988 20.2937 8.36602L17.6956 9.86602C17.2173 10.1422 16.6057 9.97829 16.3296 9.5C16.0535 9.02171 16.2173 8.41012 16.6956 8.13398L19.2937 6.63397C19.772 6.35783 20.3836 6.52171 20.6597 7ZM7.66935 14.5C7.94549 14.9783 7.78161 15.5899 7.30332 15.866L4.70525 17.366C4.22695 17.6422 3.61536 17.4783 3.33922 17C3.06308 16.5217 3.22695 15.9101 3.70525 15.634L6.30332 14.134C6.78161 13.8578 7.3932 14.0217 7.66935 14.5ZM20.6597 17C20.3836 17.4783 19.772 17.6422 19.2937 17.366L16.6956 15.866C16.2173 15.5899 16.0535 14.9783 16.3296 14.5C16.6057 14.0217 17.2173 13.8578 17.6956 14.134L20.2937 15.634C20.772 15.9101 20.9359 16.5217 20.6597 17ZM7.66935 9.5C7.3932 9.97829 6.78161 10.1422 6.30332 9.86602L3.70525 8.36602C3.22695 8.08988 3.06308 7.47829 3.33922 7C3.61536 6.52171 4.22695 6.35783 4.70525 6.63397L7.30332 8.13398C7.78161 8.41012 7.94549 9.02171 7.66935 9.5Z"></path></svg>`;
    parentEl.innerHTML = "";
    parentEl.insertAdjacentHTML("afterbegin", markup);
  }

  // Save current items to local storage
  saveItemsToStorage() {
    localStorage.setItem("items", JSON.stringify(this.currItems));
  }

  saveBookmarksToStorage() {
    localStorage.setItem("bookmarks", JSON.stringify(this.currBookmarked));
  }

  // Load items from local storage
  loadItemsFromStorage() {
    const savedItems = localStorage.getItem("items");
    if (savedItems) {
      this.currItems = JSON.parse(savedItems);
      this.currItems.forEach((item) => {
        // Don't need to push due to parsing
        // this.currItems.push(item);
        this.renderItem(item);
      });
    }
  }

  // Load information display from local storage
  loadInformationFromStorage() {
    this.itemInformation.innerHTML = "";

    const savedDisplay = localStorage.getItem("information");
    if (savedDisplay) {
      this.currInformationDisplay = JSON.parse(savedDisplay);

      // Empty display
      if (this.currInformationDisplay === "") {
        const html = `<div class="empty__display">
            <p>No item selected!</p>
          </div>`;
        this.itemInformation.insertAdjacentHTML("beforeend", html);
        return;
      }
      this.displayInformation(this.currInformationDisplay);
    }
  }

  loadCurrBookmarksFromStorage() {
    const savedBookmarks = localStorage.getItem("bookmarks");
    if (savedBookmarks) {
      this.currBookmarked = JSON.parse(savedBookmarks);

      this.emptyBookmarkDisplay();

      this.currBookmarked.forEach((item) => this.renderBookmarkItem(item));
    } else {
      this.currBookmarked = [];
    }
  }

  emptyBookmarkDisplay() {
    // Empty bookmarks
    console.log(this.currBookmarked);
    if (this.currBookmarked.length === 0) {
      this.bookmarksDisplay.innerHTML = '';
      const html = `<div class="empty__bookmarks">
            <p>No bookmarked items!</p>
          </div>`;
      this.bookmarksDisplay.insertAdjacentHTML("beforeend", html);
      return;
    }
  }

  saveCurrIconToStorage() {
    localStorage.setItem("icon", JSON.stringify(this.currIconPicked));
  }

  loadCurrIconFromStorage() {
    const savedIcon = localStorage.getItem("icon");
    if (savedIcon) {
      this.currIconPicked = JSON.parse(savedIcon);
    }
  }

  // Reset items (emptying local storage)
  resetItems() {
    if (confirm("Are you sure you want to delete all items?")) {
      localStorage.clear();
      window.location.reload();
    }
  }

  clearFormInput() {
    // Clear input
    this.nameInput.value = "";
    this.locationInput.value = "";
    this.notesInput.value = "";
  }
}

// Instantiate the App class
const app = new App();
