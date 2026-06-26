import React from 'react';
import { Code2 } from 'lucide-react';
import questionApi from '../../services/questionApi';
import QuestionExplorer from './QuestionExplorer';

const DSA = () => {
  return (
    <QuestionExplorer 
      title="Data Structures & Algorithms"
      description="Master the core algorithmic patterns frequently asked in coding interviews."
      icon={Code2}
      fetchApi={questionApi.getDSAQuestions}
      type="dsa"
    />
  );
};

export default DSA;
