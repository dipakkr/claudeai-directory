import manifest from "./media.json";

export type MediaFile = { url: string; mime: string; bytes: number; width?: number; height?: number; duration?: number; sha256: string };
export type StudioMedia = { id: string; kind: string; alt: string; width: number; height: number; files: MediaFile[] };
export const mediaAssets: StudioMedia[] = manifest.assets;
export function mediaAsset(id: string): StudioMedia {
  const asset = mediaAssets.find(item => item.id === id);
  if (!asset) throw new Error(`Missing reviewed Studio media: ${id}`);
  return asset;
}
export function mediaImage(asset: StudioMedia) {
  const file = asset.files.filter(file => file.mime === "image/webp").sort((a,b) => (b.width ?? 0) - (a.width ?? 0))[0];
  if (!file) throw new Error(`Missing poster: ${asset.id}`);
  return file;
}

export type CatalogOutput = {
  id: string; name: string; category: string; palette: string; role: string;
  output: "Web" | "Images" | "Slides"; skill: string; publisher: string;
  href: string; assetId: string; motionId?: string;
};
export const catalogOutputs: CatalogOutput[] = [
  { id:"brand-story", name:"Claude Directory Brand Story", category:"Editorial presentation", palette:"Clay Index", role:"Founder", output:"Slides", skill:"Brand Story Deck", publisher:"Supplied Skillry package", href:"/studio/brand-story-deck", assetId:"brand-story-01", motionId:"brand-story-loop" },
  { id:"avatar-robot", name:"Coral Robot", category:"3D character", palette:"Soft clay", role:"Designer", output:"Images", skill:"Dot Avatar Maker", publisher:"Supplied Skillry package", href:"/studio/dot-avatar-maker?example=avatar-robot", assetId:"avatar-robot" },
  { id:"avatar-bunny", name:"Plush Bunny", category:"3D character", palette:"Short plush", role:"Designer", output:"Images", skill:"Dot Avatar Maker", publisher:"Supplied Skillry package", href:"/studio/dot-avatar-maker?example=avatar-bunny", assetId:"avatar-bunny" },
];

export const evaluatedSkills = [
  {
    slug:"brand-story-deck", name:"Brand Story Deck", type:"Slides", package:"bs-brand-story-deck",
    description:"Turn a brand brief into an editorial presentation with bold typography, a clear narrative and independently editable objects.",
    story:"This four-slide Claude Directory story was built from our product brief using the supplied style kit and its bundled editor. The copy describes the planned product without inventing traction, customers or revenue. Each image below is captured from that generated deck.",
    assets:["brand-story-01","brand-story-02","brand-story-03","brand-story-04"], motion:"brand-story-loop",
    dependencies:"Python 3 and a modern browser", costs:"No paid generation API used in this run. Agent usage is separate.",
    output:"Editable HTML deck", resolution:"1920 × 1080 captures",
    audience:["Founders", "Brand designers", "Product teams"],
    deliverables:["A browser presentation with independently editable text and objects.","The project file and style kit used to compose the slides.","Local build and validation scripts for reviewing the deck."],
    goodFor:["Brand positioning and product narratives.","Editing a presentation directly in the browser.","Creating consistent slide images for a launch."],
    boundaries:["Supply your own approved facts and metrics.","PowerPoint compatibility requires a separate export check."],
    faq:[{question:"Can I edit the slides?",answer:"Yes. Text and objects can be edited in the bundled browser editor. We checked editing, undo, redo, saving and reopening the HTML."},{question:"Does it need a paid image API?",answer:"The displayed deck used Python and a browser without a paid generation API. Agent usage and any new image generation depend on your setup."},{question:"Is PowerPoint export verified?",answer:"The displayed example was reviewed as editable HTML. We have not verified its native PowerPoint export."}],
    checks:["Four-slide build and bundled static validation passed.","All four slides visually reviewed in Chrome. An overlapping decoration was repositioned before capture.","Full-HD slide captures and an eight-second sequence exported from the actual deck."],
    limits:"This is a local Codex-directed build and browser review. Native Claude Code execution and PowerPoint export compatibility have not been verified.",
    steps:["Provide a brand brief, audience, approved facts and slide count.","Compose the narrative with the bundled style kit, then build the editable HTML.","Open the deck, review every slide and edit the individual elements. Save the file to retain edits."],
    prompt:"Use bs-brand-story-deck to make a four-slide Claude Directory product story from the supplied brief. Use Clay Index. Show the output-first catalogue idea and the planned images, web, slides and video categories. Do not invent traction, customers or revenue.",
  },
  {
    slug:"dot-avatar-maker", name:"Dot Avatar Maker", type:"Images", package:"bs-dot-avatar-maker",
    description:"Create a character in a browser, choose its form, finish and personality, and export a transparent image.",
    story:"We ran the supplied launcher, opened the generated studio and used its form, colour, material and style controls. The coral robot and pink bunny below are native 3D renders exported from that studio. No image-generation model was used.",
    assets:["avatar-robot","avatar-bunny"], motion:undefined,
    dependencies:"Node.js, a WebGL browser and internet for the bundled Three.js CDN dependency", costs:"No paid generation API or credits used in this run. Agent usage is separate.",
    output:"Transparent PNG images", resolution:"2048 × 2048 exports",
    audience:["Designers", "Creators", "Product teams"],
    deliverables:["An editable HTML character studio and its Node.js launcher.","Controls for form, colour, material and style.","Transparent PNG export and an interactive HTML character view."],
    goodFor:["Profile avatars and playful product characters.","Trying different materials on the same character.","Rendering images locally without generation credits."],
    boundaries:["The browser needs WebGL support.","The supplied studio loads Three.js from a CDN."],
    faq:[{question:"Are these images generated by an AI model?",answer:"No. The studio renders the character locally in the browser using Three.js. The examples shown are actual PNG exports."},{question:"What size can I export?",answer:"The original package exports at 1024 × 1024. The displayed examples came from a working-copy adaptation with 2048 × 2048 transparent exports."},{question:"Can I change the character and colours?",answer:"Yes. The studio includes controls for forms, colours, materials and styles. Its editable HTML can also be adapted to your project."}],
    checks:["Supplied launcher produced a standalone studio with the requested robot preset.","All four selection steps and transparent PNG export exercised in Chrome.","Original 1024px export checked. A working copy was adapted to export and verify 2048px images."],
    limits:"The original package was kept unchanged. The working copy enables preserved canvas frames and 2048px export. Native Claude Code execution and every possible character/material combination have not been verified.",
    steps:["Run the supplied launcher to create a working copy of the studio.","Choose a form, colour, material and style in the browser.","Export a transparent PNG. The unmodified package exports at 1024px; these captures use a 2048px working-copy adaptation."],
    prompt:"Use bs-dot-avatar-maker to create a coral robot with soft clay and minimal style, then a pink bunny with short plush and artist style. Export transparent PNGs. Keep the source package unchanged; use a working copy for a 2048px export adaptation.",
  },
];
