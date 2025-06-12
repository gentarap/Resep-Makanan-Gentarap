const urlParams = new URLSearchParams(window.location.search);
const recipeId = urlParams.get("id");

if (recipeId) {
  fetch(`https://dummyjson.com/recipes/${recipeId}`)
    .then(res => res.json())
    .then(recipe => {
      document.getElementById("recipeName").textContent = recipe.name;
      document.getElementById("recipeImage").src = recipe.image;
      document.getElementById("recipeImage").alt = recipe.name;
      document.getElementById("rating").textContent = `${recipe.rating}/5`;
      document.getElementById("reviews").textContent = recipe.reviewCount;
      document.getElementById("prepTime").textContent = recipe.prepTimeMinutes;
      document.getElementById("cookTime").textContent = recipe.cookTimeMinutes;
      document.getElementById("servings").textContent = recipe.servings;
      document.getElementById("calories").textContent = recipe.caloriesPerServing;
      document.getElementById("difficulty").textContent = recipe.difficulty;
      document.getElementById("cuisine").textContent = recipe.cuisine;

      const ingredientsList = document.getElementById("ingredients");
      recipe.ingredients.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        ingredientsList.appendChild(li);
      });

      const instructionsList = document.getElementById("instructions");
      recipe.instructions.forEach(step => {
        const li = document.createElement("li");
        li.textContent = step;
        instructionsList.appendChild(li);
      });
    })
    .catch(err => {
      document.body.innerHTML = "<p>Gagal memuat detail resep.</p>";
      console.error("Gagal fetch:", err);
    });
} else {
  document.body.innerHTML = "<p>ID resep tidak ditemukan di URL.</p>";
}