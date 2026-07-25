// import { NavItem } from './global';

export const navLinks: NavItem[] = [
  { name: 'Home', path: '/' },
  { name: 'Products', path: '/products' },
  { name: 'Shops', path: '/shops' },
  { name: 'Offers', path: '/offers' },
  { name: 'Become a Seller', path: `${process.env.NEXT_PUBLIC_SELLER_URL}/login` },
];

export const defaultCategories: string[] = [
  'Electronic',
  'Fashion',
  'Home & Kitchen',
  'Sport & Fitness',
  'Beauty'
];
export const defaultSubCategories: SubCategoryMap = {
  "electronic": ['Mobile Phones', 'Laptops', 'Gaming Consoles', 'Televisions'],
  "fashion": ['Men Clothing', 'Women Clothing', 'Shoes', 'Accessories'],
  "Home & Kitchen": ['Furniture', 'Cookware', 'Home Decor', 'Appliances'],
  "Sport & Fitness": [
    'Gym Equipment',
    'Outdoor Sports',
    'Fitness Wear',
    'Cycling',
  ],
  "Beauty": [
    'Skin Care',
    'Makeup',
    'Fragrance',
    'Hair Care',
  ]
};

export type ColorOption = {
  name: string;
  bg: string;
  value: string;
};

export const colors: ColorOption[] = [
  { name: 'black', bg: 'bg-black', value: '#000000' },
  { name: 'white', bg: 'bg-white', value: '#ffffff' },
  { name: 'red', bg: 'bg-red-500', value: '#ff0000' },
  { name: 'green', bg: 'bg-green-500', value: '#00ff00' },
  { name: 'yellow', bg: 'bg-yellow-400', value: '#facc15' },
  { name: 'blue', bg: 'bg-blue-500', value: '#0000ff' },
  { name: 'magenta', bg: 'bg-fuchsia-500', value: '#d946ef' },
];
export const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const shopCategories = [
  { value: 'clothing', label: 'Clothing and Apparel' },
  { value: 'footwear', label: 'Footwear' },
  { value: 'beauty', label: 'Beauty and Personal Care' },
  { value: 'electronics', label: 'Electronics and Gadgets' },
  { value: 'home', label: 'Home and Living' },
  { value: 'furniture', label: 'Furniture and Decor' },
  { value: 'groceries', label: 'Groceries and Food Items' },
  { value: 'health', label: 'Health and Wellness' },
  { value: 'sports', label: 'Sports and Fitness' },
  { value: 'kids', label: 'Kids and Baby Products' },
  { value: 'jewelry', label: 'Jewelry and Accessories' },
  { value: 'automotive', label: 'Automotive and Accessories' },
  { value: 'books', label: 'Books and Stationery' },
  { value: 'phones', label: 'Mobile Phones and Accessories' },
  { value: 'computing', label: 'Computers and Office Equipment' },
  { value: 'gaming', label: 'Gaming and Consoles' },
  { value: 'pets', label: 'Pet Supplies' },
  { value: 'tools', label: 'Tools and Hardware' },
  { value: 'arts', label: 'Arts, Crafts and Handmade' },
  { value: 'services', label: 'Digital Products and Services' },
  { value: 'software', label: 'Software & Technology services' },
];

export const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
  "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)",
  "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica",
  "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea",
  "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
  "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon",
  "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives",
  "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia",
  "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua",
  "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama",
  "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands",
  "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland",
  "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia",
  "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
  "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe", "Kosovo"
];
// const mockProducts = Array.from({ length: 10 }).map((_, i) => ({
//     id: `item-${i}`,
//     image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
//     sold: 20,
//     title: "",
//     regularPrice: 25,
//     salePrice: 20,
// }));

// const dummyProduct = {
//   title: 'Premium Leather roses Sneaker Arranged in a luxurious Box',
//   rating: 3.5,
//   images: [
//     'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb',
//     'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
//     'https://images.unsplash.com/photo-1528701800489-20be3c7d5f6b',
//     'https://images.unsplash.com/photo-1582582429416-6b0f8c3a64e3',
//   ],
// };

// const SAMPLE_PRODUCT_DESCRIPTION = `
// <h2>Premium Running Sneakers</h2>
//
// <p>
// Experience unmatched comfort and durability with our <strong>Premium Running Sneakers</strong>.
// Designed for athletes and everyday wearers, these sneakers combine style with performance.
// </p>
//
// <img
//   src="https://images.unsplash.com/photo-1542291026-7eec264c27ff"
//   alt="Red Running Sneakers"
// />
//
// <h3>Key Features</h3>
//
// <ul>
//   <li>Breathable mesh upper for maximum airflow</li>
//   <li>Lightweight cushioned sole for shock absorption</li>
//   <li>Non-slip rubber outsole for better grip</li>
//   <li>Ergonomic design for long-lasting comfort</li>
// </ul>
//
// <p>
// Whether you're training at the gym or heading out for a casual walk,
// these sneakers adapt to your movement and provide excellent stability.
// </p>
//
// <h3>Specifications</h3>
//
// <ul>
//   <li><strong>Material:</strong> Mesh & Rubber</li>
//   <li><strong>Weight:</strong> 850g</li>
//   <li><strong>Available Sizes:</strong> 38 - 45</li>
//   <li><strong>Color Options:</strong> Red, Black, Blue</li>
// </ul>
//
// <p>
// Upgrade your footwear collection today and enjoy superior comfort and performance.
// </p>
// `;