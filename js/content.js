/* ===== SITE CONTENT ==================================================================
   Edit this file to change what the site shows. Image paths are relative to the site folder.

   projects   one entry per project, in display order. Once you save projects in the dashboard, the
              site uses that list instead and this one is only a fallback.
              id         short unique name, used in the case study address (case-study.html?p=arcs)
              kind       'viz' (product visualization) or 'id' (industrial design)
              src, alt   the thumbnail on the projects page (4:3 works best), the grey version
              srcColor   the colour version, shown on hover (images/projects/grey and /colour)
              featured   true shows it in Featured work on the home page (up to five), using
              feature    a tall image (about 1:3), and featureFade fades its bottom edge
              featureColor  the colour version of the tall image, shown on hover
                         (images/work/grey and /colour). A missing colour file just stays grey.
              link       optional address to open instead, when there is no case study
              caseStudy  null, or the case study: intro, role, tools, year, cover image, sections
                         (label, text, optional image) and slides for the Presentation view
                         (type 'image' or 'video')
   hero       two folders: images/hero/product-visualization (left of the divider) and
              images/hero/industrial-design (right). Each side steps through its list in order.
              x, y, w place the image inside the hero stage as a percent of the stage
              (0, 0, 100 fills it; the divider starts at 50 percent across).
   about      the paragraph in the About section, and portrait the photo beside it.
   skills     the Skills and tools lists, one per side.
   process    the How I work steps, in order.
   Once the home page is saved in the dashboard (Home page tab), the site uses that copy of
   hero, about, portrait, skills, process and the Book a call link instead of these.
   wallpapers the wallpaper PACKS shown on the home page and wallpapers.html. A pack holds several
              wallpapers (images), one price and one download file. price 0 means a free pack.
              The premium pack file stays private: put its address in the dashboard, not here.
   updates    the Now working on feed. The dashboard edits the live copy. media is an optional
              work in progress image or short MP4 shown beside an update (mediaType 'image' or 'video').
   contact    where the contact form sends mail, and your Calendly link (replace the placeholder).
   ==================================================================================== */
window.SITE = {
  projects: [
    {
      "id": "offgrid",
      "slug": "offgrid-recovery-max-jar",
      "name": "Offgrid Recovery Max",
      "kind": "viz",
      "src": "images/projects/grey/offgrid.png",
      "srcColor": "images/projects/colour/offgrid.png",
      "alt": "Offgrid Recovery Max supplement jar on moss",
      "blurb": "A recovery supplement jar sitting on moss, rendered up close.",
      "link": "",
      "featured": true,
      "feature": "images/work/grey/offgrid.png",
      "featureColor": "images/work/colour/offgrid.png",
      "featureFade": true,
      "visible": true,
      "caseStudy": null
    },
    {
      "id": "aurum",
      "slug": "aurum-serum-dropper-bottle",
      "name": "Aurum",
      "kind": "viz",
      "src": "images/projects/grey/aurum.png",
      "srcColor": "images/projects/colour/aurum.png",
      "alt": "Aurum serum dropper bottle with glass spheres",
      "blurb": "A gold serum dropper bottle surrounded by glass spheres.",
      "link": "",
      "featured": false,
      "feature": "",
      "featureColor": "",
      "featureFade": true,
      "visible": true,
      "caseStudy": null
    },
    {
      "id": "amg",
      "slug": "amg-steering-wheel",
      "name": "AMG Steering",
      "kind": "viz",
      "src": "images/projects/grey/amg.png",
      "srcColor": "images/projects/colour/amg.png",
      "alt": "Steering wheel render",
      "blurb": "A performance steering wheel with its hub, paddles and controls.",
      "link": "",
      "featured": true,
      "feature": "images/work/grey/amg.png",
      "featureColor": "images/work/colour/amg.png",
      "featureFade": true,
      "visible": true,
      "caseStudy": null
    },
    {
      "id": "nord",
      "slug": "nord-gear-selector",
      "name": "Nord Gear Selector",
      "kind": "viz",
      "src": "images/projects/grey/nord.png",
      "srcColor": "images/projects/colour/nord.png",
      "alt": "Rotary gear selector in carbon fiber",
      "blurb": "A rotary gear selector in carbon fiber and brushed metal.",
      "link": "",
      "featured": true,
      "feature": "images/work/grey/nord.png",
      "featureColor": "images/work/colour/nord.png",
      "featureFade": true,
      "visible": true,
      "caseStudy": null
    },
    {
      "id": "arcs",
      "slug": "arcs-tank-cleaning-robot",
      "name": "A.R.C.S",
      "kind": "id",
      "src": "images/projects/grey/arcs.png",
      "srcColor": "images/projects/colour/arcs.png",
      "alt": "A.R.C.S tracked robot",
      "blurb": "A modular robot that scans and cleans oil tanks.",
      "link": "",
      "featured": true,
      "feature": "images/work/grey/arcs.png",
      "featureColor": "images/work/colour/arcs.png",
      "featureFade": true,
      "visible": true,
      "caseStudy": {
        "on": true,
        "intro": "A modular robot that scans and cleans oil tanks.",
        "role": "[Your role]",
        "tools": "Blender, [More tools]",
        "year": "[Year]",
        "cover": "images/case-study/render.png",
        "coverAlt": "A.R.C.S tracked robot, finished render",
        "sections": [
          {
            "label": "Problem",
            "text": "[What the robot had to solve, who it is for, and what was wrong with the way it was done before.]",
            "image": "",
            "alt": ""
          },
          {
            "label": "Approach",
            "text": "[How the design came together: the constraints, the options you weighed and what you chose.]",
            "image": "images/case-study/clay.png",
            "alt": "A.R.C.S clay model"
          },
          {
            "label": "Technical detail",
            "text": "[Dimensions, mechanisms, materials and anything an engineer would ask about. Add a diagram if you have one.]",
            "image": "",
            "alt": ""
          },
          {
            "label": "Output",
            "text": "[What was delivered: renders, animation, drawings or files. Add the numbers that matter.]",
            "image": "",
            "alt": ""
          }
        ],
        "slides": [
          {
            "type": "image",
            "src": "images/case-study/01.jpg",
            "alt": "A.R.C.S robot cleaning inside an oil tank",
            "caption": "Inside an oil tank"
          },
          {
            "type": "image",
            "src": "images/case-study/02.jpg",
            "alt": "A.R.C.S from the side with its arm folded",
            "caption": "Side view, arm folded"
          },
          {
            "type": "image",
            "src": "images/case-study/03.jpg",
            "alt": "Two A.R.C.S robots seen from the front and the back",
            "caption": "Front and rear"
          },
          {
            "type": "image",
            "src": "images/case-study/04.jpg",
            "alt": "A.R.C.S from a three quarter angle",
            "caption": "Three quarter view"
          },
          {
            "type": "image",
            "src": "images/case-study/05.jpg",
            "alt": "Close up of A.R.C.S with a second robot behind",
            "caption": "Close up"
          },
          {
            "type": "image",
            "src": "images/case-study/06.jpg",
            "alt": "A.R.C.S lights and tracks in a dark room",
            "caption": "Low light"
          },
          {
            "type": "video",
            "src": "images/case-study/09-animation.mp4",
            "alt": "Animation test of A.R.C.S",
            "caption": "Animation test"
          },
          {
            "type": "image",
            "src": "images/case-study/07.jpg",
            "alt": "HONE robot with the arm folded over the body",
            "caption": "HONE, arm folded"
          },
          {
            "type": "image",
            "src": "images/case-study/08.jpg",
            "alt": "HONE robot with the arm raised",
            "caption": "HONE, arm raised"
          },
          {
            "type": "image",
            "src": "images/case-study/render.png",
            "alt": "A.R.C.S tracked robot, finished render",
            "caption": "Finished render"
          },
          {
            "type": "image",
            "src": "images/case-study/clay.png",
            "alt": "A.R.C.S clay model",
            "caption": "Clay model"
          }
        ]
      }
    },
    {
      "id": "keyboard",
      "slug": "mechanical-keyboard-numpad",
      "name": "Mechanical Keyboard",
      "kind": "id",
      "src": "images/projects/grey/keyboard.png",
      "srcColor": "images/projects/colour/keyboard.png",
      "alt": "Mechanical keyboard with a detachable numpad",
      "blurb": "A mechanical keyboard with a detachable numpad and a control knob.",
      "link": "",
      "featured": true,
      "feature": "images/work/grey/keyboard.png",
      "featureColor": "images/work/colour/keyboard.png",
      "featureFade": false,
      "visible": true,
      "caseStudy": null
    }
  ],
  hero: {
    viz: [
  {
    "src": "images/hero/product-visualization/1-offgrid.png",
    "alt": "Offgrid Recovery Max render on moss",
    "x": 0,
    "y": 0,
    "w": 100,
    "caption": "Photoreal visualization, animation and physics simulation"
  },
  {
    "src": "images/hero/product-visualization/2-keyboard.png",
    "alt": "Mechanical keyboard render over soft cushion forms",
    "x": -6,
    "y": 0,
    "w": 100,
    "caption": "Mechanical keyboard, product visualization"
  },
  {
    "src": "images/hero/product-visualization/3-aurum.png",
    "alt": "Aurum serum dropper bottle with glass spheres",
    "x": -5,
    "y": 0,
    "w": 100,
    "caption": "Aurum serum, product visualization"
  }
],
    id: [
  {
    "src": "images/hero/industrial-design/1-arcs-clay.png",
    "alt": "A.R.C.S clay model",
    "x": 0,
    "y": 0,
    "w": 100,
    "caption": "Mechanical modeling and engineering-led product design"
  }
]
  },
  contact: { to: 'freddie@frddycppr.com', calendly: 'https://calendly.com/freddiecooper/discovery-call' },
  /* Page background in light and dark mode. The dashboard's Home page tab overrides these. */
  colors: { light: '#d6d6d6', dark: '#1c1c1c' },
  about: "I'm Freddie Cooper, a 3D product designer based in Abuja. My background is petroleum engineering, which is why I care about how things actually work before I make them look good. I build in Blender, from product visuals to simulations and custom tools.",
  portrait: { src: 'images/about/portrait.jpg', alt: 'Portrait of Freddie Cooper' },
  skills: {
    viz: ['Blender', 'Photoreal rendering', 'Material creation', 'Product animation', 'Physics simulation', 'Python scripting'],
    id: ['Fusion 360', 'Mechanical modeling', 'Technical drawing', 'Blender']
  },
  process: [
    { title: 'Brief', text: 'Goals, references and the one thing the visual must prove.' },
    { title: 'Model', text: 'Accurate geometry built from real dimensions and materials.' },
    { title: 'Animate', text: 'Motion and simulation tested early, refined in review.' },
    { title: 'Deliver', text: 'Final renders, video and source files, ready to use.' }
  ],
};

/* Fallbacks: used until you add wallpapers and updates in the dashboard (they are then served from /api). */
SITE.wallpapers = [
  {
    "id": "steering-wheel",
    "name": "Steering Wheel Collection",
    "price": 8,
    "currency": "USD",
    "blurb": "Four steering wheel wallpapers in powder blue, forest green and espresso brown. Two for desktop and two for mobile.",
    "file": "",
    "sampleFile": "images/wallpapers/free/forest-desktop-full.jpg",
    "sampleLabel": "Forest Wheel, desktop",
    "visible": true,
    "images": [
      {
        "preview": "images/wallpapers/powder-blue-desktop.jpg",
        "device": "desktop",
        "res": "2576 x 1449",
        "label": "Powder Blue Wheel"
      },
      {
        "preview": "images/wallpapers/forest-desktop.jpg",
        "device": "desktop",
        "res": "2576 x 1449",
        "label": "Forest Wheel"
      },
      {
        "preview": "images/wallpapers/espresso-mobile.jpg",
        "device": "mobile",
        "res": "1449 x 2576",
        "label": "Espresso Close Up"
      },
      {
        "preview": "images/wallpapers/forest-mobile.jpg",
        "device": "mobile",
        "res": "1449 x 2576",
        "label": "Forest Close Up"
      }
    ]
  }
];
SITE.updates = [
  {
    "id": "u1",
    "date": "2026-10-12",
    "status": "In progress",
    "title": "Wallpaper packs",
    "note": "Building the first desktop and mobile wallpaper packs, with a free set and a premium set.",
    "media": "images/wallpapers/forest-desktop.jpg",
    "mediaType": "image",
    "mediaAlt": "Forest green steering wheel wallpaper",
    "visible": true
  },
  {
    "id": "u2",
    "date": "2026-10-10",
    "status": "In progress",
    "title": "A.R.C.S case study",
    "note": "Writing up the design process and adding the animation test.",
    "media": "images/case-study/09-animation.mp4",
    "mediaType": "video",
    "mediaAlt": "Animation test of the A.R.C.S robot",
    "visible": true
  }
];
