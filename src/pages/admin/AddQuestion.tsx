// New component for question creation
import { QuestionTypeSelector } from '@/components/QuestionType';

export default function AddQuestion() {
  const [type, setType] = useState<QuestionType>('multiple_choice');
  
  return (
    <div>
      <select 
        value={type}
        onChange={(e) => setType(e.target.value as QuestionType)}
      >
        <option value="multiple_choice">Multiple Choice</option>
        <option value="true_false">True/False</option>
        <option value="short_answer">Short Answer</option>
      </select>

      {type === 'multiple_choice' && <MultipleChoiceForm />}
      {type === 'true_false' && <TrueFalseForm />}
      {type === 'short_answer' && <ShortAnswerForm />}
    </div>
  );
}
