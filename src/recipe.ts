import { Recipe as CooklangRecipe } from "@cooklang/cooklang-ts";

class Recipe extends CooklangRecipe {
  constructor(source: string) {
    super(source);
  }

  getName(): string {
    return this.metadata.name;
  }

  getTags(): string[] {
    const tags = this.metadata.tags;
    return tags.split(",").map((tag) => tag.substring(1));
  }
}

export default Recipe;
