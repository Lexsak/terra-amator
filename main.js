let currentProducts = products;
let categories = new Set();
let basket = [];
let addToBasketButtons;

//render products
const productsSection = document.querySelector(".products");
function renderProducts(items) {
    productsSection.innerHTML = "";
    for (let i = 0; i < items.length; i++) {
        const newProduct = document.createElement('div');
        newProduct.className = `product-item ${items[i].sale ? 'on-sale' : ''}`;
        newProduct.innerHTML = `<div class="product-image">
        <img src="${items[i].image}" alt="${items[i].name}"></div>
        <p class="product-name">${items[i].name}</p>
        <p class="product-description">
            ${items[i].description}
        </p>
        <div class="product-price">
            <span class="price">${items[i].price.toFixed(2)} zł</span>
            <span class="price-sale">${(items[i].price - items[i].saleAmount).toFixed(2)} zł</span>
        </div>
        <button data-id="${items[i].id}" class="product-add-to-basket-btn">
            Dodaj do koszyka
        </button>
        <p class="product-item-sale-info">Promocja</p>
        `;

        productsSection.appendChild(newProduct)
    }

    addToBasketButtons = document.querySelectorAll('.product-add-to-basket-btn');
    addToBasketButtons.forEach((btn) => btn.addEventListener("click", addToBasket));
}

//render categories
function renderCategories(items) {
    for (let i = 0; i < items.length; i++) {
        categories.add(items[i].category);
    }
    const categoriesItems = document.querySelector('.categories-items');

    console.log(categories);
    categories = ["wszystkie", ...categories];
    console.log(categories);

    categories.forEach((category, index) => {
        const newCategory = document.createElement('button');
        newCategory.innerHTML = category;
        newCategory.dataset.category = category;


        index === 0 ? newCategory.classList.add('active') : "";

        //above, a faster version of if
        //  if(index === 0){
        //     newCategory.classList.add('active');
        //  }
        //  else{
        //     ""
        //  }

        categoriesItems.appendChild(newCategory);
    });
}


document.onload = renderProducts(currentProducts);
document.onload = renderCategories(currentProducts);



// category buttons, renders products depending on the category
const categoriesButtons = document.querySelectorAll('.categories-items button');
categoriesButtons.forEach((btn) => btn.addEventListener('click',
    (e) => {
        const category = e.target.dataset.category;

        categoriesButtons.forEach((btn) => btn.classList.remove('active'));
        e.target.classList.add('active');

        currentProducts = products;

        if (category === "wszystkie") {
            currentProducts = products;
        }
        else {
            currentProducts = currentProducts.filter((product) => product.category === category);
        }

        renderProducts(currentProducts);

    }));

// search bar, refreshes products with each letter entered
const searchbBarInput = document.querySelector(".search-bar-input");
searchbBarInput.addEventListener('input', (e) => {
    const search = e.target.value;

    const foundProducts = currentProducts.filter((product) => {
        if (product.name.toLowerCase().includes(search.toLowerCase())) {
            return product;
        }
    });

    const emptyState = document.querySelector('.empty-state');
    if (foundProducts.length === 0)
        emptyState.classList.add('active');
    else
        emptyState.classList.remove('active');

    renderProducts(foundProducts);
});


// everything related to the basket, adds, removes and counts
const basketAmountSpan = document.querySelector(".basket-amount");
const basketClearBtn = document.querySelector(".basket-clear-btn");
function addToBasket(e) {
    const selectedId = parseInt(e.target.dataset.id);

    const key = currentProducts.findIndex((product) =>
        product.id === selectedId

    );
    basket.push(currentProducts.at(key));

    // const basketTotal = basket.reduce((sum, product) => {
    //     return (sum += product.price - (product.saleAmount ? product.saleAmount : 0));
    // }, 0);

    // basketTotal > 0
    //     ? basketClearBtn.classList.add("active")
    //     : basketClearBtn.classList.remove("active")

    // basketAmountSpan.innerHTML = `${basketTotal.toFixed(2)} zł`;

    updateBasketTotal();
    updateCartPopup();
}

const basketAmountSidebar = document.querySelector(".basket-amount-sidebar");
function updateBasketTotal() {
    const basketTotal = basket.reduce((sum, product) => {
        return (sum += product.price - (product.saleAmount ? product.saleAmount : 0));
    }, 0);

    basketTotal > 0
        ? basketClearBtn.classList.add("active")
        : basketClearBtn.classList.remove("active");

    basketAmountSpan.innerHTML = `${basketTotal.toFixed(2)} zł`;
    basketAmountSidebar.innerHTML = `${basketTotal.toFixed(2)} zł`;
}

function clearBasket() {
    basketAmountSpan.innerHTML = "Koszyk";
    basketAmountSidebar.innerHTML = "0.00";
    basket = [];
    basketClearBtn.classList.remove("active");
    updateCartPopup();
}
basketClearBtn.addEventListener("click", clearBasket);

// cart popup
const basketProducts = document.querySelector(".basket-products");
function updateCartPopup() {
    basketProducts.innerHTML = ""; // Clear the basket display first

    if (basket.length === 0) {
        basketProducts.innerHTML = "<p>Koszyk jest pusty.</p>";
    } else {
        const productCounts = {};

        // Count the quantity of each product in the basket
        basket.forEach((product) => {
            if (productCounts[product.id]) {
                productCounts[product.id]++;
            } else {
                productCounts[product.id] = 1;
            }
        });

        // Display the products and quantities
        for (const productId in productCounts) {
            if (productCounts.hasOwnProperty(productId)) {
                const product = basket.find((item) => item.id === parseInt(productId));
                const quantity = productCounts[productId];

                const productItem = document.createElement("div");
                productItem.classList.add("basket-product-item");

                // Add product image
                const productImage = document.createElement("img");
                productImage.src = product.image;
                productImage.alt = product.name;

                // Add product name with quantity
                const productName = document.createElement("span");
                productName.textContent = `${product.name} x${quantity}`;

                const removeOneButton = document.createElement("button");
                removeOneButton.textContent = "Usuń 1";
                removeOneButton.addEventListener("click", () => removeOneFromBasket(product.id));

                const removeAllButton = document.createElement("button");
                removeAllButton.textContent = "Usuń wszystkie";
                removeAllButton.addEventListener("click", () => removeAllFromBasket(product.id));

                productItem.appendChild(productImage);
                productItem.appendChild(productName);
                productItem.appendChild(removeOneButton);
                productItem.appendChild(removeAllButton);
                basketProducts.appendChild(productItem);
            }
        }
    }
}

function removeOneFromBasket(productId) {
    const indexToRemove = basket.findIndex((product) => product.id === productId);
    if (indexToRemove !== -1) {
        basket.splice(indexToRemove, 1);
        updateBasketTotal();
        updateCartPopup();
    }
}

function removeAllFromBasket(productId) {
    basket = basket.filter((product) => product.id !== productId);
    updateBasketTotal();
    updateCartPopup();
}

document.onload = updateCartPopup();

const toggleBtn = document.querySelector(".sidebar-toggle");
const closeBtn = document.querySelector(".close-btn");
const sidebar = document.querySelector(".sidebar");

toggleBtn.addEventListener('click', function () {
    sidebar.classList.toggle("show-sidebar");
})

closeBtn.addEventListener('click', function () {
    sidebar.classList.remove("show-sidebar");
})