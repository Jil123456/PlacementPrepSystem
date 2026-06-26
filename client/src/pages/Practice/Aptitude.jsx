import React from 'react';
import { BrainCircuit } from 'lucide-react';
import questionApi from '../../services/questionApi';
import QuestionExplorer from './QuestionExplorer';

const Aptitude = () => {
  return (
    <QuestionExplorer 
      title="Aptitude & Logical Reasoning"
      description="Sharpen your quantitative and logical skills to ace the first round of placements."
      icon={BrainCircuit}
      fetchApi={questionApi.getAptitudeQuestions}
      type="aptitude"
    />
  );
};

export default Aptitude;
