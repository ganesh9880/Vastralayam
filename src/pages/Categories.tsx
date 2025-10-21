import { PageLayout } from "@/components/layout/PageLayout";
import { Container } from "@/components/layout/Container";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const categories = [
  { name: "Sarees", path: "/categories/sarees", emoji: "👘", description: "Elegant traditional sarees" },
  { name: "Kids Wear", path: "/categories/kids", emoji: "👶", description: "Comfortable kids clothing" },
  { name: "Men's Wear", path: "/categories/mens", emoji: "👔", description: "Formal and casual wear" },
  { name: "Festive", path: "/categories/festive", emoji: "✨", description: "Special occasion outfits" },
];

const Categories = () => {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <Container>
        <h1 className="text-2xl font-heading font-bold mb-6">Shop by Category</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <Card
              key={category.name}
              className="cursor-pointer transition-all hover:scale-105 active:scale-95"
              onClick={() => navigate(category.path)}
            >
              <CardContent className="flex items-center gap-4 py-6">
                <span className="text-5xl">{category.emoji}</span>
                <div>
                  <h3 className="font-heading font-semibold text-lg mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </PageLayout>
  );
};

export default Categories;
