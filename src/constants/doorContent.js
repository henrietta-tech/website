export const doorContent = [
  {
    id: 'name',
    title: 'Why the Name Henrietta',
    summary: 'Henrietta is a person\'s name. Not a concept. Not a system. Not an abstraction.',
    content: {
      paragraphs: [
        { text: 'We chose it deliberately.', weight: 'medium' },
        { text: 'Healthcare is often discussed as policy, infrastructure, or cost. But the consequences of fragmentation are always personal — they land on individual lives, quietly and repeatedly, over time.' },
        { text: 'Henrietta stands in for that reality.' },
        { text: 'Not as a symbol of suffering, and not as a story we\'re asking you to adopt — but as a reminder that care ultimately belongs to people, not institutions.' }
      ],
      link: { text: 'About the Name →', href: '/about' }
    }
  },
  {
    id: 'problem',
    title: 'You\'re Not the Problem',
    summary: 'Fragmentation makes it feel like control keeps slipping away. Systems move people through — they don\'t hold onto them.',
    content: {
      paragraphs: [
        { text: 'It comes from systems designed to move people through without really holding onto them.' },
        { text: 'When something changes, pieces get left behind — and you\'re expected to pick them up yourself. Sometimes that includes a new problem to manage, or a cost you didn\'t choose.' },
        { text: 'Over time, this starts to feel normal. Care becomes something you respond to — instead of something you build ahead of time.' },
        { text: 'So people adapt. For many, health becomes something they manage quietly — through routines, habits, and constant self-adjustment — outside a system that feels reactive, expensive, or misaligned.' },
        { text: 'It doesn\'t have to be this isolated.', weight: 'medium' }
      ]
    }
  },
  {
    id: 'dpc',
    title: 'Why Direct Primary Care Matters',
    summary: 'Direct Primary Care gets the relationship right. Time, continuity, prevention — without insurance intermediaries.',
    content: {
      paragraphs: [
        { text: 'Direct Primary Care creates space for time, continuity, prevention, and long-term thinking — not just responses to problems.' },
        { text: 'Instead of insurance billing, people work directly with a primary care clinician through a simple, predictable membership. That structure allows care to be built through trust, familiarity, and ongoing engagement.' }
      ]
    }
  },
  {
    id: 'gap',
    title: 'The Gap Henrietta Exists to Fill',
    summary: 'DPC fixes care. Infrastructure hasn\'t caught up. When people move or practices change, continuity breaks.',
    content: {
      paragraphs: [
        { text: 'When a DPC practice closes, when a doctor retires, when someone moves to a new city — the relationship can persist, but the infrastructure often doesn\'t.' },
        { text: 'Health information fragments. Continuity breaks. People start over.' },
        { text: 'Not because the model failed. Because the infrastructure around it was never built to move with them. Ownership and portability were never part of the design.' },
        { text: 'DPC gets care right. Henrietta is being built to make sure that care can last — across time, across geography, across life changes.', weight: 'medium' }
      ]
    }
  },
  {
    id: 'who',
    title: 'Who This Is For',
    summary: 'For people who take an active role in their health. Not waiting for crisis — building over time.',
    content: {
      paragraphs: [
        { text: 'Henrietta is being built for people who take an active role in their health — regardless of where they\'re starting from.' },
        { text: 'Not waiting for crisis. Not reacting to problems after they appear. Building and maintaining over time.' },
        { text: 'People who participate in decisions, relationships, and long-term thinking.' },
        { text: 'This isn\'t about being perfectly healthy. It\'s about being engaged:', weight: 'medium' }
      ],
      list: [
        'People who ask questions',
        'People who make intentional choices about their care',
        'People who want to participate in shaping infrastructure, not just consume it',
        'People who think in decades, not just doctor visits'
      ],
      closingParagraphs: [
        { text: 'No matter your current health status, if you\'re someone who shows up proactively — this is for you.' },
        { text: 'We\'re looking for people who have agency and want to use it. Not because they\'re desperate, but because they\'re intentional.' }
      ]
    }
  },
  {
    id: 'help',
    title: 'Help Build What Lasts',
    summary: 'We\'re mapping where momentum already exists. This is how care that works can last.',
    content: {
      paragraphs: [
        { text: 'Right now, we\'re building the foundation.', weight: 'medium' },
        { text: 'Mapping where Direct Primary Care exists — Understanding where practices are, where interest is growing, and where gaps remain.', strong: 'Mapping where Direct Primary Care exists' },
        { text: 'Connecting people to care — Helping engaged individuals find Direct Primary Care practices as the network develops.', strong: 'Connecting people to care' },
        { text: 'Building the infrastructure — The groundwork that makes continuity and patient stewardship possible.', strong: 'Building the infrastructure' },
        { text: 'When you join the registry, you\'re helping us understand where momentum already exists — and where it needs support.' }
      ],
      infoBox: {
        title: 'We\'re not asking for medical information.',
        paragraphs: [
          'Nothing you share will be used to diagnose, treat, market, or sell services.',
          'This is about:'
        ],
        list: [
          'Where you are',
          'Whether you\'re interested in Direct Primary Care',
          'Whether you\'re want to stay informed as Henrietta develops'
        ],
        closing: 'That\'s it.'
      },
      cta: true
    }
  }
];

export const heroContent = {
  title: 'Henrietta',
  paragraphs: [
    'Healthcare isn\'t something we\'re given. It doesn\'t wait for permission or arrive on someone else\'s terms. It has to be built — protected, and carried forward.',
    'What\'s at stake isn\'t a system — it\'s whether you have to keep starting over.'
  ],
  highlight: 'Henrietta is being built by the people who will use it. There\'s no product yet. We\'re inviting people to help shape what comes next.'
};

export const footerContent = {
  message: 'Henrietta is still being built. Shaped by the people who choose to take part.',
  grounding: 'This project hasn\'t accepted corporate or institutional backing. What comes next depends on who stays close — and why.',
  links: []
};

export const registryContent = {
  step1: {
    title: 'Join the Registry',
    description: 'We\'re not collecting medical information. This helps us understand where interest exists and whether you want to stay informed.',
    fields: [
      { name: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com', required: true },
      { name: 'zipCode', label: 'ZIP Code', type: 'text', placeholder: '12345', pattern: '[0-9]{5}', required: true }
    ]
  },
  step2: {
    title: 'Help us understand better',
    description: 'Optional questions — you can skip these entirely.',
    questions: [
      {
        name: 'inDPC',
        label: 'Are you currently in a DPC practice?',
        type: 'radio',
        options: ['Yes', 'No', 'Not sure what DPC is']
      },
      {
        name: 'contactPreference',
        label: 'Would you like to be contacted by DPC practices in your area?',
        type: 'radio',
        options: ['Yes', 'No', 'Maybe later']
      },
      {
        name: 'referralSource',
        label: 'How did you hear about Henrietta? (Optional)',
        type: 'text',
        placeholder: 'Friend, article, search...'
      }
    ]
  },
  step3: {
    title: 'You\'re in',
    content: {
      paragraphs: [
        'We\'ll reach out when there\'s something meaningful to share. No frequent updates. No marketing.',
        'If you want to stay close:'
      ],
      links: [
        { text: 'Read updates', href: '#updates' },
        { text: 'Statement of Use', href: '#statement' }
      ],
      closing: 'Otherwise, we\'ll be in touch when it matters.'
    }
  }
};