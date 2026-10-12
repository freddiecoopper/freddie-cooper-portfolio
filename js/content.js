/* ===== SITE CONTENT ==================================================================
   Edit this file to change what the site shows. Image paths are relative to the site folder.

   projects   one entry per project, in display order.
              kind 'viz' (product visualization) or 'id' (industrial design).
              href is an optional link to a case study page, or '' for none.
   hero       two folders: images/hero/product-visualization (left of the divider) and
              images/hero/industrial-design (right). Each side steps through its list in order.
              x, y, w place the image inside the hero stage as a percent of the stage
              (0, 0, 100 fills it; the divider starts at 50 percent across).
   about      the paragraph in the About section.
   slides     the Presentation view on the case study page: type 'image' or 'video'.
   ==================================================================================== */
window.SITE = {
  projects: [
  {
    "name": "Offgrid Recovery Max",
    "kind": "viz",
    "src": "images/projects/offgrid.png",
    "alt": "Offgrid Recovery Max supplement jar on moss",
    "blurb": "A recovery supplement jar sitting on moss, rendered up close.",
    "href": ""
  },
  {
    "name": "Aurum",
    "kind": "viz",
    "src": "images/projects/aurum.png",
    "alt": "Aurum serum dropper bottle with glass spheres",
    "blurb": "A gold serum dropper bottle surrounded by glass spheres.",
    "href": ""
  },
  {
    "name": "AMG Steering",
    "kind": "viz",
    "src": "images/projects/amg.png",
    "alt": "Steering wheel render",
    "blurb": "A performance steering wheel with its hub, paddles and controls.",
    "href": ""
  },
  {
    "name": "Nord Gear Selector",
    "kind": "viz",
    "src": "images/projects/nord.png",
    "alt": "Rotary gear selector in carbon fiber",
    "blurb": "A rotary gear selector in carbon fiber and brushed metal.",
    "href": ""
  },
  {
    "name": "A.R.C.S",
    "kind": "id",
    "src": "images/projects/arcs.png",
    "alt": "A.R.C.S tracked robot",
    "blurb": "A modular robot that scans and cleans oil tanks.",
    "href": "case-study.html"
  },
  {
    "name": "Mechanical Keyboard",
    "kind": "id",
    "src": "images/projects/keyboard.png",
    "alt": "Mechanical keyboard with a detachable numpad",
    "blurb": "A mechanical keyboard with a detachable numpad and a control knob.",
    "href": ""
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
  contact: { to: 'favour02fred@gmail.com', calendly: 'https://calendly.com/freddiecooper/discovery-call' },
  about: "I'm Freddie Cooper, a 3D product designer based in Abuja. My background is petroleum engineering, which is why I care about how things actually work before I make them look good. I build in Blender, from product visuals to simulations and custom tools.",
  slides: [
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
};
