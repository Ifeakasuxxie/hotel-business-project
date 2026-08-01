import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";

export default function RestaurantPage() {
  const menuItems = [
    {
      id: "royal-steak",
      name: "Prime Aged Ribeye Steak",
      category: "Main Courses",
      price: "₦18,500",
      description: "Grilled 300g ribeye steak served with truffle mashed potatoes and red wine jus.",
    },
    {
      id: "jollof-fiesta",
      name: "Executive Seafood Jollof Rice",
      category: "Local Delicacies",
      price: "₦14,000",
      description: "Smoky firewood jollof rice served with grilled jumbo prawns, calamari, and plantain.",
    },
    {
      id: "caesar-salmon",
      name: "Grilled Salmon Caesar Salad",
      category: "Starters & Salads",
      price: "₦12,500",
      description: "Fresh romaine lettuce, shaved parmesan, garlic croutons, and pan-seared Norwegian salmon.",
    },
    {
      id: "truffle-pasta",
      name: "Creamy Truffle Tagliatelle",
      category: "Pasta & Italian",
      price: "₦16,000",
      description: "Handmade pasta tossed in black truffle cream sauce, wild mushrooms, and parmesan crisp.",
    },
  ];

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="gold">Fine Dining & Room Service</Badge>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-slate-100">
          The Royale Restaurant & Cuisine
        </h1>
        <p className="text-slate-400">
          Explore gourmet culinary masterworks crafted from fresh local ingredients and international culinary traditions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {menuItems.map((item) => (
          <Card key={item.id} className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-amber-400 border-amber-500/30">{item.category}</Badge>
                <span className="font-serif text-lg font-bold text-amber-400">{item.price}</span>
              </div>
              <CardTitle>{item.name}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" size="sm" className="w-full gap-2">
                <ShoppingBag className="h-4 w-4 text-amber-400" /> Add to Food Order
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
