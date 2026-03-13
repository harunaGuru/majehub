'use client';

import dynamic from 'next/dynamic';
import {
  Controller,
  Control,
  FieldValues,
  Path
} from 'react-hook-form';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
});

type RichTextEditorProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  error?: any
};

export function RichTextEditor<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  error,
}: RichTextEditorProps<T>) {
  const modules = {
    toolbar: [
      [{ font: [] }, { size: ['small', false, 'large', 'huge'] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ script: 'sub' }, { script: 'super' }],
      [
        { list: 'ordered' },
        { list: 'bullet' },
        { indent: '-1' },
        { indent: '+1' },
      ],
      [{ align: [] }],
      ['blockquote', 'code-block', 'link', 'image', 'video'],
      ['clean'],
    ],
  };

  const formats = [
    'font',
    'size',
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'script',
    'list',
    // 'bullet',
    'indent',
    'align',
    'blockquote',
    'code-block',
    'link',
    'image',
    'video',
  ];

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-medium text-white">{label}</label>
      )}

      <div className="bg-transparent border border-gray-700 rounded-md">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <ReactQuill
              theme="snow"
              value={field.value || ''}
              onChange={field.onChange}
              modules={modules}
              formats={formats}
              placeholder={placeholder}
              className="text-white"
            />
          )}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error.message}</p>}

      <style jsx global>{`
        .ql-toolbar {
          background: transparent !important;
          border: none;
          color: white;
          border-bottom: 1px solid #374151;
        }
        .ql-toolbar.ql-snow {
          box-shadow: none; /* remove shadow for snow theme */
          border: none;
          border-bottom: 1px solid #374151;
          color: white;
        }
        .ql-container {
          background: transparent;
          border: none;
        }

        .ql-container.ql-snow {
          box-shadow: none; /* remove shadow for snow theme */
          border: none;
        }
        .ql-editor {
          min-height: 200px;
          color: white;
        }
         .ql-editor.ql-blank::before {
          color: #aaa !important;
        }
        .ql-stroke {
          stroke: white !important;
        }

        .ql-fill {
          fill: white;
        }

        .ql-picker {
          color: white !important;
        }
        .ql-picker-item{
          color: white !important;
        }
        .ql-picker-option {
          color: white !important;
        }
      `}</style>
    </div>
  );
}
