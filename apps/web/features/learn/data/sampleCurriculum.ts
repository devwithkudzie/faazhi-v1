import type { LearnCurriculum, Scene } from "../types";

const numberSystemScenes: Scene[] = [
  {
    id: "number-systems-hook",
    type: "concept",
    eyebrow: "Scene 1 · Concept",
    title: "Computers need number systems",
    duration: 62,
    narration:
      "A number system is a way of representing values using a fixed set of symbols. In computer science, you move between denary, binary, and hexadecimal depending on what the question is asking.",
    captions: [
      {
        id: "ns1",
        start: 0,
        end: 7,
        text: "A number system is a way of representing values.",
      },
      {
        id: "ns2",
        start: 7,
        end: 17,
        text: "For 9618, the core systems are denary, binary, and hexadecimal.",
      },
      {
        id: "ns3",
        start: 17,
        end: 29,
        text: "The exam usually asks you to convert values and show your method.",
      },
    ],
    blocks: [
      "Denary is base 10 and uses digits 0-9.",
      "Binary is base 2 and uses digits 0 and 1.",
      "Hexadecimal is base 16 and uses digits 0-9 and A-F.",
    ],
    examinerInsight:
      "A clean method is worth marks. Never give only the final answer when the question says show your working.",
  },
  {
    id: "number-systems-map",
    type: "diagram",
    eyebrow: "Scene 2 · Diagram",
    title: "The same value, three representations",
    duration: 70,
    narration:
      "The value does not change when it is written in a different number system. Only the representation changes. One hundred and seventy eight in denary can be written as one zero one one zero zero one zero in binary.",
    captions: [
      {
        id: "ns4",
        start: 0,
        end: 9,
        text: "The value stays the same. The representation changes.",
      },
      {
        id: "ns5",
        start: 9,
        end: 20,
        text: "178 in denary can be represented as 10110010 in binary.",
      },
    ],
    blocks: [
      "178₁₀ is a denary representation.",
      "10110010₂ is a binary representation.",
      "B2₁₆ is a hexadecimal representation.",
    ],
    diagram: {
      bits: [
        { bit: 1, value: 128, active: true },
        { bit: 0, value: 64 },
        { bit: 1, value: 32, active: true },
        { bit: 1, value: 16, active: true },
        { bit: 0, value: 8 },
        { bit: 0, value: 4 },
        { bit: 1, value: 2, active: true },
        { bit: 0, value: 1 },
      ],
      result: "178₁₀ = 10110010₂ = B2₁₆",
    },
    examinerInsight:
      "Use subscripts or labels where possible. They prevent ambiguity between binary and denary values.",
  },
  {
    id: "number-systems-place-values",
    type: "example",
    eyebrow: "Scene 3 · Worked example",
    title: "Use place values to convert",
    duration: 86,
    narration:
      "Place values make conversion systematic. Write one hundred and twenty eight down to one above the binary digits. Add the place values where the bit is one.",
    captions: [
      {
        id: "ns6",
        start: 0,
        end: 8,
        text: "Write the place values above the binary digits.",
      },
      {
        id: "ns7",
        start: 8,
        end: 19,
        text: "Add only the columns where the bit is 1.",
      },
      {
        id: "ns8",
        start: 19,
        end: 30,
        text: "For 10110010, add 128, 32, 16, and 2.",
      },
    ],
    blocks: [
      "Step 1: List place values from right to left.",
      "Step 2: Match each bit to a place value.",
      "Step 3: Add values under every 1.",
    ],
    diagram: {
      bits: [
        { bit: 1, value: 128, active: true },
        { bit: 0, value: 64 },
        { bit: 1, value: 32, active: true },
        { bit: 1, value: 16, active: true },
        { bit: 0, value: 8 },
        { bit: 0, value: 4 },
        { bit: 1, value: 2, active: true },
        { bit: 0, value: 1 },
      ],
      result: "128 + 32 + 16 + 2 = 178",
    },
    examinerInsight:
      "If the final answer is wrong but the selected columns are clear, you may still earn method marks.",
  },
  {
    id: "number-systems-try-it",
    type: "interactive",
    eyebrow: "Try It · Inline interaction",
    title: "Choose the correct denary value",
    duration: 58,
    narration:
      "Now try it yourself. Convert one zero zero one one zero one zero from binary into denary. Select the answer that matches the selected place values.",
    captions: [
      {
        id: "ns9",
        start: 0,
        end: 8,
        text: "Try converting 10011010₂ to denary.",
      },
      {
        id: "ns10",
        start: 8,
        end: 18,
        text: "Use the place values 128, 64, 32, 16, 8, 4, 2, and 1.",
      },
    ],
    question: "Convert 10011010₂ to denary.",
    choices: ["138", "146", "154", "166"],
    answer: "154",
    blocks: [
      "10011010₂ uses 128, 16, 8, and 2.",
      "128 + 16 + 8 + 2 = 154.",
    ],
    examinerInsight:
      "This is a lightweight Try It moment: answer, get feedback, then continue the scene flow.",
  },
  {
    id: "number-systems-pseudocode-link",
    type: "code",
    eyebrow: "Scene 5 · Code thinking",
    title: "Think algorithmically",
    duration: 66,
    narration:
      "A conversion is also an algorithm. You repeatedly inspect place values, decide whether to include them, then build the total.",
    captions: [
      {
        id: "ns11",
        start: 0,
        end: 9,
        text: "A conversion method is an algorithm.",
      },
      {
        id: "ns12",
        start: 9,
        end: 20,
        text: "Inspect each place value and build the total.",
      },
    ],
    code: "total <- 0\nFOR each bit FROM left TO right\n  IF bit = 1 THEN\n    total <- total + placeValue\n  ENDIF\nNEXT bit\nOUTPUT total",
    blocks: [
      "This connects Paper 1 representation to Paper 2 algorithmic thinking.",
      "The same method can be traced by hand or implemented in pseudocode.",
    ],
    examinerInsight:
      "Faazhi can later route this scene into the Pseudocode Runner for a deeper interactive mode.",
  },
  {
    id: "number-systems-embedded-checkpoint",
    type: "checkpoint",
    eyebrow: "Embedded checkpoint",
    title: "Exam-style checkpoint",
    duration: 72,
    narration:
      "Checkpoint. Convert one one zero zero one one zero one to denary and state one reason why binary is used in computer systems.",
    captions: [
      {
        id: "ns13",
        start: 0,
        end: 8,
        text: "Convert 11001101₂ to denary.",
      },
      {
        id: "ns14",
        start: 8,
        end: 18,
        text: "Then state why binary is used in computer systems.",
      },
      {
        id: "ns15",
        start: 18,
        end: 30,
        text: "The conversion answer is 205.",
      },
    ],
    question:
      "Convert 11001101₂ to denary. Then state one reason computers use binary.",
    choices: [
      "205, because digital circuits have two stable states",
      "197, because binary is easier for humans",
      "205, because hexadecimal has sixteen digits",
      "211, because binary stores decimal digits directly",
    ],
    answer: "205, because digital circuits have two stable states",
    blocks: [
      "11001101₂ = 128 + 64 + 8 + 4 + 1 = 205.",
      "Binary maps well to electronic circuits with two stable states.",
    ],
    examinerInsight:
      "This checkpoint combines calculation and explanation, which is common in structured questions.",
  },
  {
    id: "number-systems-paper-extract",
    type: "checkpoint",
    eyebrow: "Digital paper checkpoint",
    title: "Structured paper extract",
    duration: 96,
    narration:
      "Now answer a paper-style extraction. Use the digital answer fields exactly as you would write on an exam paper, showing your conversion working where needed.",
    captions: [
      {
        id: "ns15a",
        start: 0,
        end: 8,
        text: "This is a paper-style checkpoint with digital answer fields.",
      },
      {
        id: "ns15b",
        start: 8,
        end: 18,
        text: "Show your working, not only the final answer.",
      },
      {
        id: "ns15c",
        start: 18,
        end: 32,
        text: "Marks are awarded for method, conversion accuracy, and clear binary grouping.",
      },
    ],
    paperQuestion: {
      paperRef: "9618/13/M/J/24",
      questionRef: "Q1(a)",
      marks: 6,
      prompt:
        "A student stores values using binary and hexadecimal representations.\n\n(i) Convert the binary value 10101101 to denary.\n(ii) Convert the denary value 349 to hexadecimal.\n(iii) Convert the hexadecimal value 7C to binary.",
      answerFields: [
        {
          id: "binary-to-denary",
          label: "(i) 10101101 to denary",
          lines: 3,
          placeholder: "Show place values and final denary value.",
        },
        {
          id: "denary-to-hex",
          label: "(ii) 349 to hexadecimal",
          lines: 3,
          placeholder: "Show division or grouping method.",
        },
        {
          id: "hex-to-binary",
          label: "(iii) 7C to binary",
          lines: 3,
          placeholder: "Convert each hex digit into four bits.",
        },
      ],
      markScheme: [
        {
          criterion: "10101101 = 128 + 32 + 8 + 4 + 1 = 173",
          marks: 2,
        },
        {
          criterion: "349 divided or grouped correctly to give 15D",
          marks: 2,
        },
        {
          criterion: "7C converted as 0111 1100",
          marks: 2,
        },
      ],
    },
    blocks: [
      "This mirrors a real structured paper response instead of a simple multiple choice checkpoint.",
      "Later, the same component can be powered by PaperLab question data and marking rubrics.",
    ],
    examinerInsight:
      "For paper-style questions, the input design should preserve the exam habit of showing method while still feeling digital.",
  },
  {
    id: "number-systems-examiner-callout",
    type: "callout",
    eyebrow: "Examiner insight",
    title: "How to secure the marks",
    duration: 46,
    narration:
      "When a question asks for a conversion, write the place values or grouping clearly. When it asks for an explanation, use the words base, digit, bit, and place value accurately.",
    captions: [
      {
        id: "ns16",
        start: 0,
        end: 8,
        text: "Show place values or grouping clearly.",
      },
      {
        id: "ns17",
        start: 8,
        end: 18,
        text: "Use technical vocabulary accurately.",
      },
    ],
    blocks: [
      "For conversion: show working.",
      "For explanation: use exact terms.",
      "For comparison: say what changes and what stays the same.",
    ],
    examinerInsight:
      "Weak answers often say binary is used because computers understand it. Strong answers explain the two-state hardware link.",
  },
];

const binaryScenes: Scene[] = [
  {
    id: "binary-concept",
    type: "concept",
    eyebrow: "Scene 1",
    title: "What is binary?",
    duration: 70,
    narration:
      "Every value in a computer is stored as zeros and ones. Binary is base two, so each position represents a power of two.",
    captions: [
      {
        id: "c1",
        start: 0,
        end: 8,
        text: "Every value in a computer is stored as 0s and 1s.",
      },
      {
        id: "c2",
        start: 8,
        end: 18,
        text: "Binary is base 2, so every column has only two possible digits.",
      },
      {
        id: "c3",
        start: 18,
        end: 34,
        text: "Each position represents a power of 2.",
      },
    ],
    blocks: [
      "Binary uses two symbols: 0 and 1.",
      "Each place value doubles as you move left.",
      "A 1 means include that place value. A 0 means ignore it.",
    ],
    diagram: {
      bits: [
        { bit: 1, value: 128, active: true },
        { bit: 0, value: 64 },
        { bit: 1, value: 32, active: true },
        { bit: 1, value: 16, active: true },
        { bit: 0, value: 8 },
        { bit: 0, value: 4 },
        { bit: 1, value: 2, active: true },
        { bit: 0, value: 1 },
      ],
      result: "128 + 32 + 16 + 2 = 178",
    },
    examinerInsight:
      "Students often write the columns in the wrong direction. Start from 1 on the right and double left.",
  },
  {
    id: "binary-conversion",
    type: "example",
    eyebrow: "Scene 2",
    title: "Convert binary to denary",
    duration: 82,
    narration:
      "To convert a binary number to denary, add the place values where the bit is one. Ignore every column with a zero.",
    captions: [
      {
        id: "c4",
        start: 0,
        end: 10,
        text: "Add the place values where the bit is 1.",
      },
      {
        id: "c5",
        start: 10,
        end: 20,
        text: "Ignore every column where the bit is 0.",
      },
      {
        id: "c6",
        start: 20,
        end: 35,
        text: "For 10110010, the total is 178.",
      },
    ],
    blocks: [
      "Write the place values above the binary digits.",
      "Circle the columns that contain 1.",
      "Add those values carefully.",
    ],
    diagram: {
      bits: [
        { bit: 1, value: 128, active: true },
        { bit: 0, value: 64 },
        { bit: 1, value: 32, active: true },
        { bit: 1, value: 16, active: true },
        { bit: 0, value: 8 },
        { bit: 0, value: 4 },
        { bit: 1, value: 2, active: true },
        { bit: 0, value: 1 },
      ],
      result: "10110010₂ = 178₁₀",
    },
    examinerInsight:
      "Show your addition in exam answers. It can earn method marks even if the final total is wrong.",
  },
  {
    id: "binary-checkpoint",
    type: "checkpoint",
    eyebrow: "Embedded checkpoint",
    title: "Quick challenge",
    duration: 58,
    narration:
      "Pause and try this one. Convert 11001101 to denary. Then check your column values before moving on.",
    captions: [
      {
        id: "c7",
        start: 0,
        end: 8,
        text: "Try converting 11001101 to denary.",
      },
      {
        id: "c8",
        start: 8,
        end: 18,
        text: "Check your place values: 128, 64, 32, 16, 8, 4, 2, 1.",
      },
      {
        id: "c9",
        start: 18,
        end: 28,
        text: "The expected answer is 205.",
      },
    ],
    question: "Convert 11001101₂ to denary.",
    choices: ["197", "205", "211", "225"],
    answer: "205",
    examinerInsight:
      "Embedded checkpoints should interrupt the flow lightly, then return the learner to the explanation.",
  },
];

const hexScenes: Scene[] = [
  {
    id: "hex-concept",
    type: "concept",
    eyebrow: "Scene 1",
    title: "Why hexadecimal matters",
    duration: 64,
    narration:
      "Hexadecimal is base sixteen. It is shorter than binary and easier for humans to read when representing long bit patterns.",
    captions: [
      {
        id: "h1",
        start: 0,
        end: 10,
        text: "Hexadecimal is base 16.",
      },
      {
        id: "h2",
        start: 10,
        end: 22,
        text: "One hex digit represents four binary bits.",
      },
    ],
    blocks: [
      "Hex digits go from 0 to 9, then A to F.",
      "A = 10, B = 11, C = 12, D = 13, E = 14, F = 15.",
      "Group binary digits in fours from the right.",
    ],
    examinerInsight:
      "When converting binary to hex, pad on the left if the final group has fewer than four bits.",
  },
];

export const sampleCurriculum: LearnCurriculum = {
  subjectId: "9618",
  subjectTitle: "Computer Science 9618",
  moduleId: "paper-1",
  moduleTitle: "Paper 1",
  progress: 38,
  topics: [
    {
      id: "information-representation",
      title: "Information Representation",
      lessonCount: 5,
      lessons: [
        {
          id: "number-systems",
          title: "Number systems",
          kind: "lesson",
          durationLabel: "14 min",
          state: "current",
          scenes: numberSystemScenes,
        },
        {
          id: "binary-number-systems",
          title: "Binary number systems",
          kind: "lesson",
          durationLabel: "8 min",
          state: "available",
          scenes: binaryScenes,
        },
        {
          id: "hexadecimal",
          title: "Hexadecimal",
          kind: "lesson",
          durationLabel: "6 min",
          state: "available",
          scenes: hexScenes,
        },
        {
          id: "binary-arithmetic",
          title: "Binary arithmetic",
          kind: "lesson",
          durationLabel: "7 min",
          state: "available",
          scenes: binaryScenes.slice(1),
        },
        {
          id: "image-sound-encoding",
          title: "Images & sound encoding",
          kind: "lesson",
          durationLabel: "9 min",
          state: "available",
          scenes: binaryScenes.slice(0, 2),
        },
      ],
      topicalAssessment: {
        id: "information-representation-assessment",
        title: "Topical assessment",
        durationLabel: "20 min",
        state: "available",
      },
    },
    {
      id: "communication-networking",
      title: "Communication & Networking",
      lessonCount: 4,
      lessons: [
        {
          id: "network-models",
          title: "Network models",
          kind: "lesson",
          durationLabel: "7 min",
          state: "available",
          scenes: binaryScenes.slice(0, 2),
        },
      ],
      topicalAssessment: {
        id: "communication-assessment",
        title: "Topical assessment",
        durationLabel: "18 min",
        state: "locked",
      },
    },
    {
      id: "hardware-virtual-machines",
      title: "Hardware & Virtual Machines",
      lessonCount: 4,
      lessons: [],
      topicalAssessment: {
        id: "hardware-assessment",
        title: "Topical assessment",
        durationLabel: "18 min",
        state: "locked",
      },
    },
  ],
  moduleAssessment: {
    id: "paper-1-module-assessment",
    title: "Paper 1 - Module assessment",
    durationLabel: "55 min",
    state: "available",
  },
};

export function getSampleCurriculum() {
  return sampleCurriculum;
}
