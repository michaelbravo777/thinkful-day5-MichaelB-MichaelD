'use strict';

const STORE = {
  items: [
    {id: cuid(), name: "apples", checked: false, editing: false},
    {id: cuid(), name: "oranges", checked: false, editing: false},
    {id: cuid(), name: "milk", checked: true, editing: false},
    {id: cuid(), name: "bread", checked: false, editing: false}
  ],
  hideCompleted: false,
  searchCriteria: ""
};

function generateItemElement(item) {
  return `
    <li data-item-id="${item.id}">
      <div class="shopping-item js-shopping-item ${item.checked ? "shopping-item__checked" : ''} ${item.editing ? "hidden" : ''}">${item.name}</div>
      <input type="text" name="shopping-list-text" class="js-shopping-list-text ${item.editing ? '' : "hidden"}" value="${item.name}">
      <div class="shopping-item-controls">
        <button class="shopping-item-toggle js-item-toggle">
            <span class="button-label">check</span>
        </button>
        <button class="shopping-item-delete js-item-delete">
            <span class="button-label">delete</span>
        </button>
      </div>
    </li>`;
}

function generateShoppingItemsString(shoppingList) {
  console.log("Generating shopping list element");

  const items = shoppingList.map((item) => generateItemElement(item));
  
  return items.join("");
}


function renderShoppingList() {
  // render the shopping list in the DOM
  console.log('`renderShoppingList` ran');

  // set up a copy of the store's items in a local variable that we will reassign to a new
  // version if any filtering of the list occurs
  let filteredItems = STORE.items;

  // if the `hideCompleted` property is true, then we want to reassign filteredItems to a version
  // where ONLY items with a "checked" property of false are included
  if (STORE.hideCompleted) {
    filteredItems = filteredItems.filter(item => !item.checked);
  }

  if (STORE.searchCriteria.length > 0) {
    console.log("Filtering items with search: " + STORE.searchCriteria);
    filteredItems = filteredItems.filter(item => item.name.indexOf(STORE.searchCriteria)===0);
    STORE.searchCriteria = "";
  }

  // at this point, all filtering work has been done (or not done, if that's the current settings), so
  // we send our `filteredItems` into our HTML generation function 
  const shoppingListItemsString = generateShoppingItemsString(filteredItems);

  // insert that HTML into the DOM
  $('.js-shopping-list').html(shoppingListItemsString);
}


function addItemToShoppingList(itemName) {
  console.log(`Adding "${itemName}" to shopping list`);
  STORE.items.push({id: cuid(), name: itemName, checked: false, editing: false});
}

function handleNewItemSubmit() {
  $('#js-shopping-list-form').submit(function(event) {
    event.preventDefault();
    console.log('`handleNewItemSubmit` ran');
    const newItemName = $('.js-shopping-list-entry').val();
    $('.js-shopping-list-entry').val('');
    addItemToShoppingList(newItemName);
    renderShoppingList();
  });
}

function itemTextFilter() {
  $('#js-shopping-list-form').on('input',function(event){
    console.log('`itemTextFilter` ran');
    STORE.searchCriteria = $('.js-shopping-list-entry').val();
    renderShoppingList();
  });
}

function modifyItemText() {
  $('.js-shopping-list').on('keypress', `.js-shopping-list-text`, event => {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){
      const id = getItemIdFromElement(event.currentTarget);
      const item = STORE.items.find(item => item.id === id);
      item.name = getModifiedItemText(event.currentTarget);
      toggleEditingForListItem(id)
      renderShoppingList();
    }
  });
}

function toggleCheckedForListItem(itemId) {
  console.log("Toggling checked property for item with id " + itemId);
  const item = STORE.items.find(item => item.id === itemId);
  item.checked = !item.checked;
}

function toggleEditingForListItem(itemId) {
  console.log("Toggling Editing property for item with id " + itemId);
  const item = STORE.items.find(item => item.id === itemId);
  item.editing = !item.editing;
}

function getItemIdFromElement(item) {
  return $(item)
    .closest('li')
    .data('item-id');
}

function getModifiedItemText(item) {
  return $(item)
    .closest('li :input')
    .val();
}

function handleItemCheckClicked() {
  $('.js-shopping-list').on('click', `.js-item-toggle`, event => {
    console.log('`handleItemCheckClicked` ran');
    const id = getItemIdFromElement(event.currentTarget);
    toggleCheckedForListItem(id);
    renderShoppingList();
  });
}

function handleItemTextClicked() {
  $('.js-shopping-list').on('click', `.js-shopping-item`, event => {
    console.log('`handleItemTextClicked` ran');
    const id = getItemIdFromElement(event.currentTarget);
    toggleEditingForListItem(id)
    renderShoppingList();
  });
}

// name says it all. responsible for deleting a list item.
function deleteListItem(itemId) {
  console.log(`Deleting item with id  ${itemId} from shopping list`)

  // as with `addItemToShoppingLIst`, this function also has the side effect of
  // mutating the global STORE value.
  //
  // First we find the index of the item with the specified id using the native
  // Array.prototype.findIndex() method. Then we call `.splice` at the index of 
  // the list item we want to remove, with a removeCount of 1.
  const itemIndex = STORE.items.findIndex(item => item.id === itemId);
  STORE.items.splice(itemIndex, 1);
}


function handleDeleteItemClicked() {
  // like in `handleItemCheckClicked`, we use event delegation
  $('.js-shopping-list').on('click', '.js-item-delete', event => {
    // get the index of the item in STORE
    const itemIndex = getItemIdFromElement(event.currentTarget);
    // delete the item
    deleteListItem(itemIndex);
    // render the updated shopping list
    renderShoppingList();
  });
}

// Toggles the STORE.hideCompleted property
function toggleHideFilter() {
  STORE.hideCompleted = !STORE.hideCompleted;
}

// Places an event listener on the checkbox for hiding completed items
function handleToggleHideFilter() {
  $('.js-hide-completed-toggle').on('click', () => {
    toggleHideFilter();
    renderShoppingList();
  });
}

// this function will be our callback when the page loads. it's responsible for
// initially rendering the shopping list, and activating our individual functions
// that handle new item submission and user clicks on the "check" and "delete" buttons
// for individual shopping list items.
function handleShoppingList() {
  renderShoppingList();
  handleNewItemSubmit();
  handleItemCheckClicked();
  handleItemTextClicked();
  handleDeleteItemClicked();
  handleToggleHideFilter();
  itemTextFilter();
  modifyItemText();
}

// when the page loads, call `handleShoppingList`
$(handleShoppingList);
