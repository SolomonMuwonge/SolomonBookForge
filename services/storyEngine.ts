import { GoogleGenAI } from "@google/genai";

/**
 * Story Engine
 * A narrative generation system that creates immersive, scene-based prose.
 * Leverages high-performance AI models for professional-grade writing.
 */

export interface StoryParams {
  title: string;
  genre: string;
  description: string;
  chapterNumber: number;
  tensionLevel: number; // 1-5
}

class StoryEngine {
  private sensoryDetails: Record<string, string[]> = {
    'Fantasy': [
      'The scent of ozone and ancient parchment hung heavy in the damp air.',
      'A low, rhythmic chanting seemed to vibrate from the very stones of the wall.',
      'Tiny sparks of blue light danced along the edges of the shadows.',
      'The iron taste of magic lingered on the back of the tongue.'
    ],
    'Sci-Fi': [
      'The sterile smell of recycled air and ozone filled the corridor.',
      'The constant, subsonic thrum of the fusion core vibrated through the floor plates.',
      'Flickering holos cast jagged, neon shadows against the brushed titanium.',
      'A faint metallic tang accompanied every breath in the pressurized cabin.'
    ],
    'Mystery': [
      'The smell of old tobacco and damp wool clung to the heavy curtains.',
      'Somewhere in the house, a floorboard groaned under an invisible weight.',
      'Yellow light from a streetlamp struggled to pierce the thick, swirling fog.',
      'The cold handle of the door felt slick with condensation.'
    ],
    'Romance': [
      'The sweet fragrance of night-blooming jasmine drifted through the open window.',
      'A soft melody from a distant piano wove through the quiet evening air.',
      'The golden glow of sunset softened the sharp angles of the room.',
      'The warmth of a lingering glance felt more substantial than any words.'
    ],
    'Thriller': [
      'The metallic scent of rain on hot asphalt rose from the dark alleyway.',
      'Every siren in the distance sounded like a personal countdown.',
      'Fluorescent lights hummed with a maddening, persistent buzz.',
      'The sudden chill of the wind felt like a warning whispered against the neck.'
    ],
    'Fiction': [
      'The comforting aroma of roasting coffee bean drifted from the corner kitchen.',
      'The muffled sounds of the city provided a steady, heartbeat-like rhythm.',
      'Morning light spilled across the worn wooden table, highlighting every scratch.',
      'The dry rustle of autumn leaves echoed against the brick walls.'
    ]
  };

  /**
   * Generates a multi-paragraph, immersive chapter.
   */
  async generateChapter(params: StoryParams): Promise<string> {
    const { title, genre, description, chapterNumber, tensionLevel } = params;
    // Create fresh instance per request as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const sensory = this.getSensory(genre, chapterNumber);
    
    const prompt = `Write an immersive, scene-based book chapter with the following context:
    - Book Title: "${title}"
    - Genre: ${genre}
    - Initial Premise: ${description}
    - Chapter Number: ${chapterNumber}
    - Desired Tension Level: ${tensionLevel}/5
    - Starting Sensory Detail: ${sensory}
    
    Focus on "showing, not telling". Use rich sensory details and professional literary style.
    Output only the narrative text formatted in HTML (using <div>, <p>, <b>, <i> tags). 
    Do not include the title "Chapter ${chapterNumber}" or any headers.`;

    try {
      // Use gemini-3-pro-preview for complex creative writing tasks
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          systemInstruction: `You are a world-class novelist specializing in ${genre}. Your goal is to write atmospheric, engaging prose that fits the user's book description. Always output valid HTML parts.`,
          temperature: 0.75,
          // Reserve thinking budget for high quality prose
          thinkingConfig: { thinkingBudget: 4000 }
        }
      });
      
      return response.text || this.generateFallback(params, sensory);
    } catch (error) {
      console.error("Story Engine Generation Error:", error);
      return this.generateFallback(params, sensory);
    }
  }

  /**
   * Extends the current narrative with seamless, scene-based prose.
   */
  async continueStory(params: StoryParams, currentContent: string): Promise<string> {
    const { title, genre, description, tensionLevel } = params;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `Continue the following story naturally. Maintain the established tone and narrative voice.
    
    Context:
    - Book Title: "${title}"
    - Genre: ${genre}
    - Overall Premise: ${description}
    - Targeted Tension: ${tensionLevel}/5
    
    Current Narrative:
    ${currentContent}
    
    Write the next 100-250 words of the scene. Output only the new text in HTML format.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          systemInstruction: "You are a professional ghostwriter and editor. Your task is to continue the narrative provided by the user seamlessly.",
          temperature: 0.8,
          thinkingConfig: { thinkingBudget: 2000 }
        }
      });
      return response.text || "";
    } catch (error) {
      console.error("Story Engine Continuation Error:", error);
      return `<p>The narrative weight of "${title}" shifts, though the path ahead remains obscured in silence...</p>`;
    }
  }

  private getSensory(genre: string, seed: number): string {
    const options = this.sensoryDetails[genre] || this.sensoryDetails['Fiction'];
    return options[seed % options.length];
  }

  private generateFallback(params: StoryParams, sensory: string): string {
    return `<div><p>${sensory}</p><p>The world of "${params.title}" began to take shape under the weight of an untold history. It was a time of transition, where the memory of ${params.description.toLowerCase()} guided every decision. As the events of Chapter ${params.chapterNumber} unfolded, the tension began to mount, promising a journey from which there was no turning back.</p></div>`;
  }
}

export const storyEngine = new StoryEngine();