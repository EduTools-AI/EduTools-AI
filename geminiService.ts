
import { GoogleGenAI } from "@google/genai";
import { GeneratorParams, ToolMode } from "./types";

// 1. SYSTEM PROMPT
const SYSTEM_PROMPT = `You are EduTools AI, a specialised educational content generation system built for South African CAPS-aligned Technical Subjects, with primary focus on Mechanical Technology (Fitting & Machining) at Grades 10–12 (NSC level). You are NOT a general tutor or chatbot. You operate as a senior CAPS examiner, subject advisor, and experienced classroom educator combined. Your outputs must be classroom-ready, exam-standard, and professionally formatted.`;

// 2. SUBJECT ENGINE PROMPTS
const MECH_TECH_MASTER_PROMPT = `
[SUBJECT ENGINE: MECHANICAL TECHNOLOGY]
You have deep working knowledge of the CAPS curriculum, NSC examination structure, and Department of Basic Education assessment standards. You have practical experience as a Mechanical Technology / Fitting & Machining educator. You prioritise accuracy, alignment, clarity, and assessment validity. Subject Scope: Mechanical Technology, Fitting & Machining, Grades 10-12. Topics include Safety, Tools, Materials, Measurements, Lubrication, Bearings, Power Transmission, Systems and Control, Forces, Terminology.
`;

const GENERIC_CAPS_SUBJECT_PROMPT = `
[SUBJECT ENGINE: GENERIC CAPS MODE]
You act as a CAPS-aligned subject educator and assessment designer. You generate formal South African CAPS-compliant assessment content for Grades 4–12. You follow CAPS terminology and structure, respect grade-appropriate cognitive demand, and use subject-specific command verbs.
`;

export const generateEducationalContent = async (params: GeneratorParams): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  // SELECT SUBJECT ENGINE PROMPT
  // The user prompt logic specifies a check for "Mechanical Technology – Fitting & Machining"
  const isMechTech = params.subject.includes("Mechanical Technology");
  const subjectEnginePrompt = isMechTech ? MECH_TECH_MASTER_PROMPT : GENERIC_CAPS_SUBJECT_PROMPT;

  // 3. TOOL MODE INSTRUCTIONS & 4. USER INPUTS & 5. OUTPUT FORMATS
  let toolModeInstruction = "";
  let userInputBlock = "";
  let outputFormatBlock = "";

  switch (params.mode) {
    case ToolMode.QUESTION_GENERATOR:
      toolModeInstruction = `You are operating in TOOL MODE: QUESTION GENERATOR. Follow all rules defined in the system and subject prompts.`;
      userInputBlock = `
Generate CAPS-aligned examination questions using the following parameters:
Grade: ${params.grade}
Subject: ${params.subject}
Topic: ${params.topic}
Sub-topic: ${params.subTopic || "Not specified"}
Cognitive Level: ${params.cognitiveLevel}
Number of Questions: ${params.questionCount}
Total Marks: ${params.totalMarks || "Allocate appropriately"}

Use CAPS-appropriate command verbs. Ensure realistic NSC-level difficulty.`;
      outputFormatBlock = `
Output format:
- Number each question clearly
- Include sub-questions where appropriate
- Indicate mark allocation per question
- Do not include answers or explanations`;
      break;

    case ToolMode.MEMORANDUM:
      toolModeInstruction = `You are operating in TOOL MODE: MEMORANDUM / MODEL ANSWERS. Generate a CAPS-aligned marking memorandum.`;
      userInputBlock = `
Create a marking memorandum for the following assessment content:
Grade: ${params.grade}
Subject: ${params.subject}
Marking Style: Strict NSC Standard

Assessment Questions/Context:
${params.additionalNotes || "Please generate a memorandum based on standard NSC curriculum expectations for the topic: " + params.topic}`;
      outputFormatBlock = `
Output format:
- Number answers according to the questions
- Provide concise, correct responses
- Include marking guidelines
- Show calculations where applicable (Formula -> Substitution -> Final Answer with Units)
- Use South African technical terminology`;
      break;

    case ToolMode.WORKSHEET_BUILDER:
      toolModeInstruction = `You are operating in TOOL MODE: WORKSHEET & REVISION BUILDER.`;
      userInputBlock = `
Generate a CAPS-aligned worksheet using the following parameters:
Grade: ${params.grade}
Subject: ${params.subject}
Topic: ${params.topic}
Difficulty Progression: Mixed (Simple to Complex)
Include Answers: No

The worksheet must be classroom-ready and printable.`;
      outputFormatBlock = `
Output format:
- Title the worksheet clearly
- Structure questions logically
- Progress difficulty appropriately
- If answers are included, separate clearly at the end`;
      break;

    case ToolMode.REWRITER:
      toolModeInstruction = `You are operating in TOOL MODE: QUESTION REWRITER / DIFFICULTY ADJUSTER.`;
      userInputBlock = `
Rewrite the provided content to the following specifications:
Grade: ${params.grade}
Subject: ${params.subject}
Target Cognitive Level: ${params.cognitiveLevel}

Content to Rewrite:
${params.additionalNotes}`;
      outputFormatBlock = `
Output format:
- Provide only the rewritten question/content
- Do not include explanations or answers
- Adjust cognitive demand using CAPS-appropriate action verbs (Lower: Identify, Middle: Explain, Higher: Analyse)`;
      break;
  }

  // FINAL CONCATENATION AS PER PROMPT WIRING LOGIC
  const finalPrompt = `
${SYSTEM_PROMPT}

${subjectEnginePrompt}

${toolModeInstruction}

${userInputBlock}

${outputFormatBlock}

QUALITY CONTROL RULES:
- Avoid repetition and vague phrasing.
- Avoid incorrect technical facts.
- Avoid American or non-SA terminology.
- If any required information is missing, make professional CAPS-aligned assumptions and state them before generating.
- Maintain examiner credibility at all times.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: finalPrompt,
      config: {
        temperature: 0.15, // Extremely low temperature for strict adherence to technical facts
        topP: 0.95,
      }
    });

    return response.text || "No content generated. Please refine your inputs.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error("Assessment generation failed. Please verify your connection or subject settings.");
  }
};
