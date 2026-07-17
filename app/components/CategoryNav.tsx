import { BookOpen, Briefcase, Drama, Baby, Palette, PenTool, Sprout } from "lucide-react";

export function CategoryNav() {
  const categories = [
    { name: "นิยาย", icon: Drama },
    { name: "สารคดี", icon: BookOpen },
    { name: "พัฒนาตนเอง", icon: Sprout },
    { name: "หนังสือเด็ก", icon: Baby },
    { name: "การ์ตูน", icon: Palette },
    { name: "ธุรกิจ", icon: Briefcase },
    { name: "บทกวี", icon: PenTool },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-8 pb-16">
      <div className="w-full h-px bg-stone-200 mb-12"></div>
      
      <div className="flex flex-wrap items-center justify-center gap-4">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.name}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-stone-300 text-stone-700 bg-transparent hover:bg-stone-100 hover:border-stone-400 transition-all text-sm font-medium"
            >
              <span>{category.name}</span>
              <Icon size={16} className="text-stone-500" strokeWidth={1.5} />
            </button>
          );
        })}
      </div>
    </section>
  );
}
