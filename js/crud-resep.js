// Ambil elemen-elemen dari DOM yang dibutuhkan untuk manipulasi data dan UI
const recipeList = document.getElementById("recipeList");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");

// Input form resep
const nameInput = document.getElementById("recipeNameInput");
const imagePreview = document.getElementById("imagePreview");
const prepTimeInput = document.getElementById("prepTimeInput");
const cookTimeInput = document.getElementById("cookTimeInput");
const servingsInput = document.getElementById("servingsInput");
const difficultyInput = document.getElementById("difficultyInput");
const cuisineInput = document.getElementById("cuisineInput");
const caloriesInput = document.getElementById("caloriesInput");
const mealTypeInput = document.getElementById("mealTypeInput");
const tagsInput = document.getElementById("tagsInput");
const ingredientsInput = document.getElementById("ingredientsInput");
const instructionsInput = document.getElementById("instructionsInput");

// Template kartu dan loading/empty state
const recipeCardTemplate = document.getElementById("recipe-card-template");
const tagTemplate = document.getElementById("tag-template");
const emptyStateTemplate = document.getElementById("empty-state-template");
const loadingTemplate = document.getElementById("loading-template");

// Menyimpan data resep sementara, ID yang sedang diedit, dan gambar
let recipes = [];
let editingId = null;
let currentImage = null;

// Base URL untuk API dummy
const API_BASE = "https://dummyjson.com/recipes";

// Ambil data semua resep dari API
async function fetchRecipes() {
  try {
    showLoading();
    const response = await fetch(API_BASE);
    const data = await response.json();
    recipes = data.recipes || [];
    renderRecipes();
  } catch (error) {
    console.error("Error fetching recipes:", error);
    recipes = [];
    renderRecipes();
  }
}

// Tambah resep baru ke API
async function addRecipe(recipeData) {
  try {
    const response = await fetch(`${API_BASE}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recipeData),
    });

    if (!response.ok) throw new Error("Failed to add recipe");

    const newRecipe = await response.json();
    recipes.unshift(newRecipe); // tambah ke array lokal
    renderRecipes();
    return newRecipe;
  } catch (error) {
    console.error("Error adding recipe:", error);
    throw error;
  }
}

// Update resep berdasarkan ID
async function updateRecipe(id, recipeData) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recipeData),
    });

    if (!response.ok) throw new Error("Failed to update recipe");

    // mencari data lama dengan data baru kemudian mencocokanya kemudain render update resep
    const updatedRecipe = await response.json();
    const index = recipes.findIndex((r) => r.id === id);
    if (index !== -1) {
      recipes[index] = { ...recipes[index], ...updatedRecipe };
      renderRecipes();
    }
    return updatedRecipe;
  } catch (error) {
    console.error("Error updating recipe:", error);
    throw error;
  }
}

// Hapus resep dari API
async function deleteRecipe(id) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete recipe");

    // hapus dari array lokal gunakan filter untuk menyisakan yang tidak dihapus
    recipes = recipes.filter((r) => r.id !== id);
    renderRecipes();
    return true;
  } catch (error) {
    console.error("Error deleting recipe:", error);
    throw error;
  }
}

// Tangani upload gambar dari file input
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader(); // membaca file berdasarkan url
    reader.onload = function (e) {
      currentImage = e.target.result;
      imagePreview.src = currentImage;
      imagePreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
}

// Tampilkan modal untuk tambah/edit resep
function openModal(id = null) {
  editingId = id;
  modal.style.display = "flex";

  if (id !== null) {
    const recipe = recipes.find((r) => r.id === id);
    if (recipe) {
      populateForm(recipe);
      modalTitle.textContent = "Edit Resep";
    }
  } else {
    resetForm();
    modalTitle.textContent = "Tambah Resep";
  }
}

// Tutup modal
function closeModal() {
  modal.style.display = "none";
  editingId = null;
  currentImage = null;
}

// Isi form dengan data resep
function populateForm(recipe) {
  nameInput.value = recipe.name || "";
  prepTimeInput.value = recipe.prepTimeMinutes || "";
  cookTimeInput.value = recipe.cookTimeMinutes || "";
  servingsInput.value = recipe.servings || "";
  difficultyInput.value = recipe.difficulty || "Easy";
  cuisineInput.value = recipe.cuisine || "";
  caloriesInput.value = recipe.caloriesPerServing || "";
  tagsInput.value = recipe.tags?.join(", ") || "";
  ingredientsInput.value = recipe.ingredients?.join("\n") || "";
  instructionsInput.value = recipe.instructions?.join("\n") || "";

  // Meal type (multiple select)
  if (recipe.mealType) {
    Array.from(mealTypeInput.options).forEach((option) => {
      option.selected = recipe.mealType.includes(option.value);
    });
  }

  // Gambar
  if (recipe.image) {
    currentImage = recipe.image;
    imagePreview.src = recipe.image;
    imagePreview.style.display = "block";
  }
}

// Reset form ke kondisi awal
function resetForm() {
  nameInput.value = "";
  prepTimeInput.value = "";
  cookTimeInput.value = "";
  servingsInput.value = "";
  difficultyInput.value = "Easy";
  cuisineInput.value = "";
  caloriesInput.value = "";
  tagsInput.value = "";
  ingredientsInput.value = "";
  instructionsInput.value = "";
  currentImage = null;
  imagePreview.style.display = "none";

  // Reset opsi meal type
  Array.from(mealTypeInput.options).forEach((option) => {
    option.selected = false;
  });
}

// Simpan resep (tambah baru atau update)
async function saveRecipe() {
  if (!nameInput.value.trim()) {
    alert("Nama resep harus diisi!");
    return;
  }

  const selectedMealTypes = Array.from(mealTypeInput.selectedOptions).map(
    (option) => option.value
  );

  const recipeData = {
    name: nameInput.value.trim(),
    image: currentImage || "https://via.placeholder.com/300x200?text=No+Image",
    prepTimeMinutes: parseInt(prepTimeInput.value) || 0,
    cookTimeMinutes: parseInt(cookTimeInput.value) || 0,
    servings: parseInt(servingsInput.value) || 1,
    difficulty: difficultyInput.value,
    cuisine: cuisineInput.value.trim(),
    caloriesPerServing: parseInt(caloriesInput.value) || 0,
    mealType: selectedMealTypes,
    tags: tagsInput.value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag),
    ingredients: ingredientsInput.value
      .split("\n")
      .map((ingredient) => ingredient.trim())
      .filter((ingredient) => ingredient),
    instructions: instructionsInput.value
      .split("\n")
      .map((instruction) => instruction.trim())
      .filter((instruction) => instruction),
    rating: 0,
    reviewCount: 0,
    userId: 1,
  };

  try {
    if (editingId !== null) {
      await updateRecipe(editingId, recipeData);
    } else {
      await addRecipe(recipeData);
    }
    closeModal();
  } catch (error) {
    alert("Gagal menyimpan resep. Silakan coba lagi.");
  }
}

// Hapus resep dengan konfirmasi
async function handleDeleteRecipe(id) {
  if (confirm("Apakah Anda yakin ingin menghapus resep ini?")) {
    try {
      await deleteRecipe(id);
    } catch (error) {
      alert("Gagal menghapus resep. Silakan coba lagi.");
    }
  }
}

// Tampilkan loading
function showLoading() {
  recipeList.innerHTML = "";
  const loadingClone = loadingTemplate.content.cloneNode(true);
  recipeList.appendChild(loadingClone);
}

// Tampilkan pesan kosong jika tidak ada resep
function showEmptyState() {
  recipeList.innerHTML = "";
  const emptyClone = emptyStateTemplate.content.cloneNode(true);
  recipeList.appendChild(emptyClone);
}

// Buat kartu resep dari template
function createRecipeCard(recipe) {
  const cardClone = recipeCardTemplate.content.cloneNode(true);

  // Isi gambar
  const recipeImage = cardClone.querySelector(".recipe-image");
  recipeImage.src =
    recipe.image || "https://via.placeholder.com/300x200?text=No+Image";
  recipeImage.alt = recipe.name;
  recipeImage.onerror = function () {
    this.src = "https://via.placeholder.com/300x200?text=No+Image";
  };

  // Isi info dasar
  cardClone.querySelector(".recipe-name").textContent = recipe.name;
  cardClone.querySelector(".prep-cook-time").textContent = `⏱️ ${
    recipe.prepTimeMinutes || 0
  }+${recipe.cookTimeMinutes || 0} menit`;
  cardClone.querySelector(".servings").textContent = `👥 ${
    recipe.servings || 1
  } porsi`;
  cardClone.querySelector(".difficulty").textContent = `📊 ${
    recipe.difficulty || "Easy"
  }`;
  cardClone.querySelector(".rating").textContent = `⭐ ${recipe.rating || 0}`;
  cardClone.querySelector(".calories").textContent = `🔥 ${
    recipe.caloriesPerServing || 0
  } kal`;
  cardClone.querySelector(".cuisine").textContent = `🍽️ ${
    recipe.cuisine || "Various"
  }`;

  // Tampilkan tags
  const tagsContainer = cardClone.querySelector(".tags");
  if (recipe.tags && recipe.tags.length > 0) {
    recipe.tags.forEach((tagText) => {
      const tagClone = tagTemplate.content.cloneNode(true);
      tagClone.querySelector(".tag").textContent = tagText;
      tagsContainer.appendChild(tagClone);
    });
  }

  // Preview bahan-bahan
  const ingredientsPreview = recipe.ingredients
    ? recipe.ingredients.slice(0, 3).join(", ") +
      (recipe.ingredients.length > 3 ? "..." : "")
    : "Tidak ada bahan";
  cardClone.querySelector(".ingredients-text").textContent = ingredientsPreview;

  // Event handler untuk edit dan hapus
  const updateBtn = cardClone.querySelector(".update");
  const deleteBtn = cardClone.querySelector(".delete");
  updateBtn.addEventListener("click", () => openModal(recipe.id));
  deleteBtn.addEventListener("click", () => handleDeleteRecipe(recipe.id));

  return cardClone;
}

// Render seluruh daftar resep
function renderRecipes() {
  recipeList.innerHTML = "";
  if (recipes.length === 0) {
    showEmptyState();
    return;
  }

  recipes.forEach((recipe) => {
    const cardElement = createRecipeCard(recipe);
    recipeList.appendChild(cardElement);
  });
}

// Tutup modal jika klik area luar
window.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// Drag and drop untuk upload gambar
const imageUpload = document.querySelector(".image-upload");

imageUpload.addEventListener("dragover", (e) => {
  e.preventDefault();
  imageUpload.style.borderColor = "var(--primary-green)";
});

imageUpload.addEventListener("dragleave", (e) => {
  e.preventDefault();
  imageUpload.style.borderColor = "#ddd";
});

imageUpload.addEventListener("drop", (e) => {
  e.preventDefault();
  imageUpload.style.borderColor = "#ddd";

  const files = e.dataTransfer.files;
  if (files.length > 0 && files[0].type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = function (e) {
      currentImage = e.target.result;
      imagePreview.src = currentImage;
      imagePreview.style.display = "block";
    };
    reader.readAsDataURL(files[0]);
  }
});

// Ambil data saat halaman pertama kali dimuat
window.addEventListener("load", fetchRecipes);
