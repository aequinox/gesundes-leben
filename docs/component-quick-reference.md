# Component Quick Reference Card

> **📖 Full Documentation**: For detailed explanations and best practices, see [Component Style Guide](./component-style-guide.md)

## Import Template
```astro
import Image from "@/components/elements/Image.astro";
import List from "@/components/elements/List.astro";
import Blockquote from "@/components/elements/Blockquote.astro";
import Accordion from "@/components/elements/Accordion.astro";
```

## Common Usage Patterns

### ✅ Lists (Symptoms, Tips, Benefits)
```astro
<List items={[
  "Item 1",
  "Item 2", 
  "Item 3"
]} />
```

### ✅ Expert Tips
```astro
<Blockquote 
  quote="Expert advice here"
  author="Expert Name"
  title="Credentials"
/>
```

### ✅ Author Photos
```astro
<Image
  src="./images/autor-name-profilbild.png"
  alt="Name - Title"
  position="center"
  style="polaroid"
/>
```

### ✅ Content Images
```astro
<Image
  src="./images/image-name.jpg"
  alt="Descriptive alt text"
  position="center"
/>
```

### ✅ Warnings/Side Effects
```astro
<Accordion title="Warnung: Wichtige Information">
  Detailed warning content here
</Accordion>
```

## Migration Rules

### ❌ Don't Use
```markdown
![alt text](images/file.jpg)
- Bullet point
- Another point
```

### ✅ Use Instead
```astro
<Image src="./images/file.jpg" alt="alt text" position="center" />

<List items={[
  "Bullet point",
  "Another point"
]} />
```

## Quick Tips
- Always use `./images/` path for images
- Author photos: `style="polaroid"`
- Main images: `position="center"`
- Supporting images: `position="left"` or `position="right"`
- Dark mode images: add `invert={true}`