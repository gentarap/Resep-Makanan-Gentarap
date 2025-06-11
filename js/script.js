const recipeContainer = document.getElementById("recipeContainer");
const recipeContainer2 = document.getElementById("recipeContainer2");
const template = document.getElementById("recipe-template");
const scrollWrapper = document.querySelectorAll(".scroll-wrapper");

// ✅ Pindahkan ke luar agar global
function fillCard(clone, recipe) {
  const img = clone.querySelector(".card-image");
  const title = clone.querySelector(".card-title");
  const tags = clone.querySelector(".tags");
  const rating = clone.querySelector(".rating");
  const mealType = clone.querySelector(".meal-type");

  img.src = recipe.image;
  img.alt = recipe.name;
  title.textContent = recipe.name;
  tags.textContent = `🏷️ ${recipe.tags.join(", ")}`;
  rating.textContent = `⭐ ${recipe.rating}/5 📝 ${recipe.reviewCount} reviews`;
  mealType.textContent = `🍽 ${recipe.mealType.join(", ")}`;
}

function loadDefaultRecipes() {
  // Fetch batch pertama (0–29)
  fetch("https://dummyjson.com/recipes?limit=25&skip=0")
    .then((response) => response.json())
    .then((data) => {
      data.recipes.forEach((recipe) => {
        const clone = template.content.cloneNode(true);
        fillCard(clone, recipe);
        recipeContainer.appendChild(clone);
      });
    });

  // Fetch batch kedua (30–49)
  fetch("https://dummyjson.com/recipes?limit=50&skip=25")
    .then((response) => response.json())
    .then((data) => {
      data.recipes.forEach((recipe) => {
        const clone = template.content.cloneNode(true);
        fillCard(clone, recipe);
        recipeContainer2.appendChild(clone);
      });
    });

  // Scroll event
  document.getElementById("scrollLeft").addEventListener("click", () => {
    scrollWrapper[0].scrollBy({ left: -750, behavior: "smooth" });
  });
  document.getElementById("scrollRight").addEventListener("click", () => {
    scrollWrapper[0].scrollBy({ left: 750, behavior: "smooth" });
  });
  document.getElementById("scrollLeft2").addEventListener("click", () => {
    scrollWrapper[1].scrollBy({ left: -750, behavior: "smooth" });
  });
  document.getElementById("scrollRight2").addEventListener("click", () => {
    scrollWrapper[1].scrollBy({ left: 750, behavior: "smooth" });
  });
}

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const scrollLeft2Btn = document.getElementById("scrollLeft2");
const scrollRight2Btn = document.getElementById("scrollRight2");

searchForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;

  fetch(`https://dummyjson.com/recipes/search?q=${encodeURIComponent(query)}`)
    .then((res) => res.json())
    .then((data) => {
      console.log("Hasil pencarian:", data); // ✅ DI SINI, bukan di luar

      recipeContainer.innerHTML = "";
      recipeContainer2.innerHTML = "";

      scrollLeft2Btn.style.display = "none";
      scrollRight2Btn.style.display = "none";

      if (data.recipes.length === 0) {
        recipeContainer.innerHTML =
          "<p style='margin-left: 1rem;'>Resep tidak ditemukan.</p>";
        if (!query) {
          // Tampilkan kembali tombol scroll baris ke-2
          scrollLeft2Btn.style.display = "block";
          scrollRight2Btn.style.display = "block";
          return;
        }
        return;
      }

      data.recipes.forEach((recipe) => {
        const clone = template.content.cloneNode(true);
        fillCard(clone, recipe);
        recipeContainer.appendChild(clone);
      });
    })
    .catch((err) => {
      console.error("Error saat fetch pencarian:", err);
    });
});

loadDefaultRecipes();
