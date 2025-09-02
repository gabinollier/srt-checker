'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, Check, XCircle, AlertTriangle, Clock, Type, AlignLeft, ArrowUpDown, X } from 'lucide-react';
import { parseSRT, validateSRT, SRTValidationResult, SRTSubtitle, ValidationCriteria } from '@/lib/srt-parser';

type SortOption = 'number' | 'severity';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<SRTValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [subtitles, setSubtitles] = useState<SRTSubtitle[]>([]);
  const [timeSortBy, setTimeSortBy] = useState<SortOption>('severity');
  const [charsSortBy, setCharsSortBy] = useState<SortOption>('severity');
  const [lineSortBy, setLineSortBy] = useState<SortOption>('severity');
  
  // Critères de validation configurables
  const [minTimeGap, setMinTimeGap] = useState<number>(200); // 200ms par défaut
  const [maxCharactersPerSubtitle, setMaxCharactersPerSubtitle] = useState<number>(70); // 70 caractères par défaut
  const [maxCharactersPerLine, setMaxCharactersPerLine] = useState<number>(35); // 35 caractères par défaut

  // Option d'affichage
  const [showTimecode, setShowTimecode] = useState<boolean>(false); // Afficher numéro par défaut

  // Fonction utilitaire pour afficher l'identifiant du sous-titre
  const getSubtitleDisplay = (subtitle: SRTSubtitle) => {
    return showTimecode ? subtitle.startTime : `#${subtitle.id}`;
  };

  // Fonction pour relancer la validation avec les nouveaux critères
  const revalidateWithNewCriteria = useCallback(() => {
    if (subtitles.length > 0) {
      const criteria: ValidationCriteria = {
        minTimeGap,
        maxCharactersPerSubtitle,
        maxCharactersPerLine
      };
      const validation = validateSRT(subtitles, criteria);
      setValidationResult(validation);
    }
  }, [subtitles, minTimeGap, maxCharactersPerSubtitle, maxCharactersPerLine]);

  // Fonctions de tri
  const sortTimeIssues = (issues: any[], sortBy: SortOption) => {
    return [...issues].sort((a, b) => {
      if (sortBy === 'number') {
        return a.subtitle.id - b.subtitle.id;
      } else {
        return a.gap - b.gap; // Tri par écart (plus petit d'abord)
      }
    });
  };

  const sortCharIssues = (issues: any[], sortBy: SortOption) => {
    return [...issues].sort((a, b) => {
      if (sortBy === 'number') {
        return a.subtitle.id - b.subtitle.id;
      } else {
        return b.characterCount - a.characterCount; // Tri par dépassement (plus grand d'abord)
      }
    });
  };

  const sortLineIssues = (issues: any[], sortBy: SortOption) => {
    return [...issues].sort((a, b) => {
      if (sortBy === 'number') {
        return a.subtitle.id - b.subtitle.id;
      } else {
        return b.characterCount - a.characterCount; // Tri par dépassement (plus grand d'abord)
      }
    });
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.srt')) {
      alert('Veuillez sélectionner un fichier .srt');
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const content = await selectedFile.text();
      const parsedSubtitles = parseSRT(content);
      const criteria: ValidationCriteria = {
        minTimeGap,
        maxCharactersPerSubtitle,
        maxCharactersPerLine
      };
      const validation = validateSRT(parsedSubtitles, criteria);
      
      setSubtitles(parsedSubtitles);
      setValidationResult(validation);
    } catch (error) {
      console.error('Erreur lors du traitement du fichier:', error);
      alert('Erreur lors du traitement du fichier');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback(async (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (!droppedFile) return;

    if (!droppedFile.name.toLowerCase().endsWith('.srt')) {
      alert('Veuillez sélectionner un fichier .srt');
      return;
    }

    setFile(droppedFile);
    setIsProcessing(true);

    try {
      const content = await droppedFile.text();
      const parsedSubtitles = parseSRT(content);
      const criteria: ValidationCriteria = {
        minTimeGap,
        maxCharactersPerSubtitle,
        maxCharactersPerLine
      };
      const validation = validateSRT(parsedSubtitles, criteria);
      
      setSubtitles(parsedSubtitles);
      setValidationResult(validation);
    } catch (error) {
      console.error('Erreur lors du traitement du fichier:', error);
      alert('Erreur lors du traitement du fichier');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900">SRT Checker</h1>
        </div>

        {/* Upload Area */}
        <div className="mb-8">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center space-y-3">
              <Upload className={`h-8 w-8 ${file ? 'text-blue-600' : 'text-gray-400'}`} />
              <div>
                <p className="text-base font-medium text-gray-900">
                  Glissez-déposez votre fichier SRT ici
                </p>
                <p className="text-gray-500">ou</p>
              </div>
              <label className={`cursor-pointer px-6 py-2 rounded-lg transition-colors ${
                file 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}>
                {file ? (
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                  </div>
                ) : (
                  'Sélectionner un fichier'
                )}
                <input
                  type="file"
                  accept=".srt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Configuration des critères */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Écart temporel minimum */}
            <div className="space-y-2">
              <label htmlFor="minTimeGap" className="block text-sm font-medium text-gray-700">
                Écart temporel minimum (ms)
              </label>
              <input
                id="minTimeGap"
                type="number"
                min="0"
                value={minTimeGap}
                onChange={(e) => setMinTimeGap(Number(e.target.value))}
                onBlur={revalidateWithNewCriteria}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-neutral-700"
              />
            </div>

            {/* Caractères par sous-titre */}
            <div className="space-y-2">
              <label htmlFor="maxCharsSubtitle" className="block text-sm font-medium text-gray-700">
                Caractères max par sous-titre
              </label>
              <input
                id="maxCharsSubtitle"
                type="number"
                min="1"
                value={maxCharactersPerSubtitle}
                onChange={(e) => setMaxCharactersPerSubtitle(Number(e.target.value))}
                onBlur={revalidateWithNewCriteria}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-neutral-700"
              />
            </div>

            {/* Caractères par ligne */}
            <div className="space-y-2">
              <label htmlFor="maxCharsLine" className="block text-sm font-medium text-gray-700">
                Caractères max par ligne
              </label>
              <input
                id="maxCharsLine"
                type="number"
                min="1"
                value={maxCharactersPerLine}
                onChange={(e) => setMaxCharactersPerLine(Number(e.target.value))}
                onBlur={revalidateWithNewCriteria}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-neutral-700"
              />
            </div>
          </div>
          
          {/* Option d'affichage */}
          <div className="mb-6 py-3 ">
            <div className="flex items-center space-x-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTimecode}
                  onChange={(e) => setShowTimecode(e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Afficher les timecodes de départ au lieu des numéros
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="border border-gray-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">Analyse du fichier en cours...</span>
            </div>
          </div>
        )}

        {/* Results */}
        {validationResult && !isProcessing && (
          <div className="space-y-6">
            
            {/* Validation Results - Vertical Layout */}
            <div className="space-y-6">
              {/* Time Gap Issues */}
              <ValidationCard
                icon={<Clock className="h-6 w-6" />}
                title="Écart temporel"
                description={`Minimum ${minTimeGap}ms entre sous-titres`}
                isValid={validationResult.minTimeGapIssues.length === 0}
                issues={sortTimeIssues(validationResult.minTimeGapIssues, timeSortBy)}
                sortBy={timeSortBy}
                onSortChange={setTimeSortBy}
                renderIssue={(issue) => (
                  <div key={`${issue.subtitle.id}-gap`} className="text-sm">
                    <span className="font-semibold text-gray-900">
                      Entre les sous-titres {getSubtitleDisplay(issue.previousSubtitle)} et {getSubtitleDisplay(issue.subtitle)}
                    </span>
                    <br />
                    <span className="text-gray-600">
                      Écart: {issue.gap}ms
                    </span>
                  </div>
                )}
              />

              {/* Character Count Issues */}
              <ValidationCard
                icon={<Type className="h-6 w-6" />}
                title="Longueur des sous-titres"
                description={`Maximum ${maxCharactersPerSubtitle} caractères par sous-titre`}
                isValid={validationResult.maxCharactersIssues.length === 0}
                issues={sortCharIssues(validationResult.maxCharactersIssues, charsSortBy)}
                sortBy={charsSortBy}
                onSortChange={setCharsSortBy}
                renderIssue={(issue) => (
                  <div key={`${issue.subtitle.id}-chars`} className="text-sm">
                    <span className="font-semibold text-gray-900">Sous-titre {getSubtitleDisplay(issue.subtitle)}</span>
                    <br />
                    <div className="mt-1 text-xs text-gray-500">
                      "{issue.subtitle.text}"
                      <span className="text-gray-900"> ({issue.characterCount} caractères)</span>
                    </div>
                  </div>
                )}
              />

              {/* Line Character Issues */}
              <ValidationCard
                icon={<AlignLeft className="h-6 w-6" />}
                title="Longueur des lignes"
                description={`Maximum ${maxCharactersPerLine} caractères par ligne`}
                isValid={validationResult.maxLineCharactersIssues.length === 0}
                issues={sortLineIssues(validationResult.maxLineCharactersIssues, lineSortBy)}
                sortBy={lineSortBy}
                onSortChange={setLineSortBy}
                renderIssue={(issue) => (
                  <div key={`${issue.subtitle.id}-line-${issue.lineNumber}`} className="text-sm">
                    <span className="font-semibold text-gray-900">
                      Sous-titre {getSubtitleDisplay(issue.subtitle)}, ligne {issue.lineNumber}
                    </span>
                    <br />
                    <div className="mt-1 text-xs text-gray-500">
                      "{issue.subtitle.text}"
                      <span className="text-gray-900"> ({issue.characterCount} caractères)</span>
                    </div>
                  </div>
                )}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ValidationCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isValid: boolean;
  issues: any[];
  sortBy: SortOption;
  onSortChange: (sortBy: SortOption) => void;
  renderIssue: (issue: any) => React.ReactNode;
}

function ValidationCard({ icon, title, description, isValid, issues, sortBy, onSortChange, renderIssue }: ValidationCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className={`p-2 rounded-lg bg-neutral-100 text-neutral-600`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        {!isValid && issues.length > 0 && (
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="h-4 w-4 text-gray-600" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="text-sm border border-gray-400 rounded px-2 py-1 bg-white text-gray-800 font-medium shadow-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="number">Par ordre chronologique</option>
              <option value="severity">Trier par écart</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 mb-3 mt-6">
        {isValid ? (
          <>
            <Check className="h-5 w-5 text-green-500" />
            <span className="text-green-700 font-medium">Aucun problème</span>
          </>
        ) : (
          <>
            <span className="text-red-700 font-medium">
              {issues.length} problème{issues.length > 1 ? 's' : ''} :
            </span>
          </>
        )}
      </div>

      {!isValid && issues.length > 0 && (
        <div className="space-y-3">
          {issues.map(renderIssue)}
        </div>
      )}
    </div>
  );
}
