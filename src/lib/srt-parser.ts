export interface SRTSubtitle {
  id: number;
  startTime: string;
  endTime: string;
  text: string;
  startTimeMs: number;
  endTimeMs: number;
  lines: string[];
}

export interface SRTValidationResult {
  isValid: boolean;
  minTimeGapIssues: { subtitle: SRTSubtitle; previousSubtitle: SRTSubtitle; gap: number }[];
  maxCharactersIssues: { subtitle: SRTSubtitle; characterCount: number }[];
  maxLineCharactersIssues: { subtitle: SRTSubtitle; line: string; lineNumber: number; characterCount: number }[];
}

/**
 * Convertit un timestamp SRT (HH:MM:SS,mmm) en millisecondes
 */
function timeToMs(time: string): number {
  const [timePart, ms] = time.split(',');
  const [hours, minutes, seconds] = timePart.split(':').map(Number);
  return (hours * 3600 + minutes * 60 + seconds) * 1000 + Number(ms);
}

/**
 * Parse un fichier SRT et retourne un tableau de sous-titres
 */
export function parseSRT(content: string): SRTSubtitle[] {
  const subtitles: SRTSubtitle[] = [];
  const blocks = content.trim().split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue;

    const id = parseInt(lines[0]);
    if (isNaN(id)) continue;

    const timeLine = lines[1];
    const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
    if (!timeMatch) continue;

    const startTime = timeMatch[1];
    const endTime = timeMatch[2];
    const text = lines.slice(2).join('\n');
    const textLines = lines.slice(2);

    subtitles.push({
      id,
      startTime,
      endTime,
      text,
      startTimeMs: timeToMs(startTime),
      endTimeMs: timeToMs(endTime),
      lines: textLines
    });
  }

  return subtitles.sort((a, b) => a.startTimeMs - b.startTimeMs);
}

export interface ValidationCriteria {
  minTimeGap: number; // en millisecondes
  maxCharactersPerSubtitle: number;
  maxCharactersPerLine: number;
}

/**
 * Valide un fichier SRT selon les critères donnés
 */
export function validateSRT(subtitles: SRTSubtitle[], criteria: ValidationCriteria): SRTValidationResult {
  const result: SRTValidationResult = {
    isValid: true,
    minTimeGapIssues: [],
    maxCharactersIssues: [],
    maxLineCharactersIssues: []
  };

  for (let i = 0; i < subtitles.length; i++) {
    const subtitle = subtitles[i];

    // Vérification du gap minimum entre sous-titres
    if (i > 0) {
      const previousSubtitle = subtitles[i - 1];
      const gap = subtitle.startTimeMs - previousSubtitle.endTimeMs;
      if (gap < criteria.minTimeGap) {
        result.minTimeGapIssues.push({
          subtitle,
          previousSubtitle,
          gap
        });
        result.isValid = false;
      }
    }

    // Vérification du maximum de caractères par sous-titre
    if (subtitle.text.length > criteria.maxCharactersPerSubtitle) {
      result.maxCharactersIssues.push({
        subtitle,
        characterCount: subtitle.text.length
      });
      result.isValid = false;
    }

    // Vérification du maximum de caractères par ligne
    subtitle.lines.forEach((line, lineIndex) => {
      if (line.length > criteria.maxCharactersPerLine) {
        result.maxLineCharactersIssues.push({
          subtitle,
          line,
          lineNumber: lineIndex + 1,
          characterCount: line.length
        });
        result.isValid = false;
      }
    });
  }

  return result;
}
