export const navLinks = [
  { label: 'Work', href: '#work' },
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Process', href: '#process' },
  { label: 'Contact', href: '#contact' },
]

export type Service = {
  index: string
  title: string
  description: string
  tags: string[]
}

export const services: Service[] = [
  {
    index: '01',
    title: 'Web Development',
    description: 'Modern responsive websites designed around the business and its customers.',
    tags: ['Marketing sites', 'Landing pages', 'SEO-ready builds'],
  },
  {
    index: '02',
    title: 'Web Applications',
    description: 'Custom platforms, dashboards, portals and internal business tools.',
    tags: ['Dashboards', 'Client portals', 'Internal tools'],
  },
  {
    index: '03',
    title: 'E-Commerce',
    description: 'Online stores with product management, payments, orders and custom functionality.',
    tags: ['Storefronts', 'Payments', 'Order management'],
  },
  {
    index: '04',
    title: 'Business Systems',
    description: 'Digital tools that simplify operations, inventory, customers, sales and workflows.',
    tags: ['Inventory', 'CRM', 'Workflow automation'],
  },
  {
    index: '05',
    title: 'UI / UX Design',
    description: 'Interfaces designed to be clear, modern and conversion-focused.',
    tags: ['Interface design', 'Design systems', 'Prototyping'],
  },
  {
    index: '06',
    title: 'Digital Experiences',
    description: 'Interactive, animated and immersive web experiences for brands that want to stand out.',
    tags: ['Motion design', 'WebGL', 'Interactive storytelling'],
  },
]

export type Project = {
  id: string
  name: string
  industry: string
  type: string
  description: string
  tech: string[]
  accent: string
  featured: boolean
  /** Confirmed live and publicly reachable right now. */
  live: boolean
  challenge: string
  solution: string
  result: string
  /** Real project photo, shown full-bleed on the card (desktop). */
  image?: string
  /** Real project photo for narrow viewports, where relevant. */
  imageMobile?: string
  /** Real project logo, shown centered over the abstract brand background. */
  logo?: string
}

export const projects: Project[] = [
  {
    id: 'servis-kristi',
    name: 'Servis Kristi',
    industry: 'Automotive Services',
    type: 'Business website',
    description:
      'A service-oriented website for an automotive service business, presenting services and making the business easy to reach.',
    tech: ['Web Development', 'Business site'],
    accent: '#D71920',
    featured: true,
    live: true,
    image: '/images/projects/servis-kristi.jpg',
    imageMobile: '/images/projects/servis-kristi-mobile.jpg',
    challenge: 'The business needed a clear, credible website presenting its services and contact details.',
    solution: 'A focused business website structured around services offered and easy ways to get in touch.',
    result: 'A live business website representing the service.',
  },
  {
    id: 'lavafast',
    name: 'LavaFast',
    industry: 'Industrial Laundry',
    type: 'Business website',
    description:
      'A business website for an industrial laundry company, communicating capability and services to commercial clients.',
    tech: ['Web Development', 'Business site'],
    accent: '#D71920',
    featured: true,
    live: true,
    image: '/images/projects/lavafast.jpg',
    imageMobile: '/images/projects/lavafast-mobile.jpg',
    challenge: 'An industrial laundry business needed a website that communicated capability to commercial clients.',
    solution: 'A clear, professional business website outlining services and capacity for commercial partners.',
    result: 'A live website representing the business to commercial clients.',
  },
  {
    id: 'kokomani-auto',
    name: 'Kokomani Auto',
    industry: 'Automotive',
    type: 'E-commerce & business system',
    description:
      'A combined e-commerce and business management system for an automotive parts business, covering catalog and operations.',
    tech: ['E-commerce', 'Business system', 'Inventory'],
    accent: '#D71920',
    featured: true,
    live: true,
    image: '/images/projects/kokomani-auto.jpg',
    imageMobile: '/images/projects/kokomani-auto-mobile.jpg',
    challenge:
      'The business needed both a customer-facing store and internal tools to manage a large, frequently changing parts catalog.',
    solution:
      'A combined e-commerce storefront and internal business system sharing one catalog, covering sales and inventory in a single workflow.',
    result: 'A unified platform the business uses for both selling parts and managing stock.',
  },
  {
    id: 'diva-cosmetics',
    name: 'Diva Cosmetics',
    industry: 'Beauty & Cosmetics',
    type: 'E-commerce platform',
    description:
      'An e-commerce platform built for a cosmetics retailer, structured around product discovery, categories and a smooth checkout experience.',
    tech: ['React', 'E-commerce', 'Payments'],
    accent: '#D71920',
    featured: false,
    live: false,
    image: '/images/projects/diva-cosmetics.jpg',
    imageMobile: '/images/projects/diva-cosmetics-mobile.jpg',
    challenge:
      'The business needed an online storefront that could present a large cosmetics catalog clearly while keeping browsing and checkout simple.',
    solution:
      'A structured e-commerce platform with clear categories, product filtering and a streamlined checkout, built for straightforward day-to-day management.',
    result: 'A production e-commerce platform the business uses to sell and manage products online.',
  },
  {
    id: 'grand-gala-shoes',
    name: 'Grand Gala Shoes',
    industry: 'Footwear & Fashion',
    type: 'E-commerce experience',
    description:
      'A footwear e-commerce experience focused on product presentation and a clean, confident shopping flow.',
    tech: ['React', 'E-commerce', 'UI / UX'],
    accent: '#D71920',
    featured: false,
    live: false,
    image: '/images/projects/grandgala-shoes.jpg',
    imageMobile: '/images/projects/grandgala-shoes-mobile.jpg',
    challenge:
      'A footwear brand needed an online presence that presented products with the same confidence as the brand itself.',
    solution:
      'A clean, image-led e-commerce experience with a focused product-to-checkout flow designed around the brand.',
    result: 'A dedicated e-commerce experience live for the brand.',
  },
]

export type TechItem = {
  name: string
  category: string
  description: string
}

export const technologies: TechItem[] = [
  { name: 'React', category: 'Frontend', description: 'Component-driven interfaces built for scale and speed.' },
  { name: 'Next.js', category: 'Frontend', description: 'Production React framework with routing and rendering built in.' },
  { name: 'TypeScript', category: 'Language', description: 'Typed JavaScript for safer, more maintainable code.' },
  { name: 'JavaScript', category: 'Language', description: 'The core language powering the interactive web.' },
  { name: 'Vite', category: 'Tooling', description: 'Fast build tooling for a smooth development workflow.' },
  { name: 'Tailwind CSS', category: 'Styling', description: 'Utility-first styling for consistent, fast UI work.' },
  { name: 'Supabase', category: 'Backend', description: 'Postgres-backed backend for auth, data and storage.' },
  { name: 'PostgreSQL', category: 'Database', description: 'Reliable relational database for business-critical data.' },
  { name: 'Stripe', category: 'Payments', description: 'Secure payment processing for e-commerce and subscriptions.' },
  { name: 'REST APIs', category: 'Integration', description: 'Connecting systems and third-party services reliably.' },
  { name: 'Git', category: 'Workflow', description: 'Version control for a clean, collaborative build process.' },
  { name: 'GitHub', category: 'Workflow', description: 'Code hosting, review and collaboration for every project.' },
]

export type ProcessStep = {
  index: string
  title: string
  description: string
}

export const processSteps: ProcessStep[] = [
  { index: '01', title: 'Discover', description: 'Understand the business, users and goals.' },
  { index: '02', title: 'Plan', description: 'Define the structure, features and technical direction.' },
  { index: '03', title: 'Design', description: 'Create the visual system and user experience.' },
  { index: '04', title: 'Build', description: 'Develop the website or application.' },
  { index: '05', title: 'Launch', description: 'Test, deploy and continue improving.' },
]

export const ecosystemItems = [
  'Websites',
  'Stores',
  'Dashboards',
  'Apps',
  'CRM',
  'Inventory',
  'Booking',
  'Payments',
  'Custom Systems',
]
