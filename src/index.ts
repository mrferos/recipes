import { readdir } from "fs/promises";
import { readFileSync } from "fs";
import Recipe from "./recipe";
import { Step, StepIngredient } from "@cooklang/cooklang-ts";
import {
  StepCookware,
  StepText,
  StepTimer,
} from "@cooklang/cooklang-ts/dist/Parser";

const defaultRecipeDir = __dirname + "/../";

type RecipeIndex = { [key: string]: Recipe };
type IngredientIndex = { [key: string]: string[] };

const buildRecipeIndex = async (recipeDir: string): Promise<RecipeIndex> => {
  return (await readdir(recipeDir))
    .filter((file) => file.includes(".cook"))
    .map((file) => ({ file, buffer: readFileSync(recipeDir + file) }))
    .reduce<{ [key: string]: Recipe }>((map, resp) => {
      map[resp.file] = new Recipe(resp.buffer.toString());
      return map;
    }, {});
};

const buildIngredientIndex = (recipes: RecipeIndex): IngredientIndex => {
  const isIngredient = (
    step: StepIngredient | StepCookware | StepTimer | StepText
  ): step is StepIngredient => {
    return step.type == "ingredient";
  };

  const ingredientIndex: IngredientIndex = {};
  for (let key in recipes) {
    const recipe = recipes[key];
    recipe.steps.forEach((step: Step) => {
      const ingredient = step.filter((s) => s.type == "ingredient").pop();
      if (ingredient == undefined || !isIngredient(ingredient)) {
        return;
      }

      if (ingredientIndex[ingredient.name] == undefined) {
        ingredientIndex[ingredient.name] = [];
      }

      ingredientIndex[ingredient.name].push(key);
    });
  }

  return ingredientIndex;
};

const searchIngredientIndex = (
  ingredients: string[],
  index: IngredientIndex
): string[] => {
  const matchingRecipes: string[][] = [];
  ingredients.forEach((ingredient) => {
    const recipes = index[ingredient];
    if (recipes == undefined) {
      return;
    }

    matchingRecipes.push(recipes);
  });

  return matchingRecipes.reduce((a, b) => a.filter((c) => b.includes(c)));
};

(async () => {
  const recipes = await buildRecipeIndex(defaultRecipeDir);
  const ingredients = buildIngredientIndex(recipes);

  console.log(searchIngredientIndex(["chicken legs", "lemon"], ingredients));
})();
