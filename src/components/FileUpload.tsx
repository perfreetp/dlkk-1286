import { Upload, File, Trash2, Download } from 'lucide-react';
import type { Attachment } from '@/types';
import { formatFileSize, formatDateTime } from '@/utils/date';

interface FileUploadProps {
  attachments: Attachment[];
  onUpload?: (file: File) => void;
  onRemove?: (id: string) => void;
  readOnly?: boolean;
}

export function FileUpload({ attachments, onUpload, onRemove, readOnly = false }: FileUploadProps) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!readOnly && onUpload) {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        onUpload(files[0]);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!readOnly && onUpload && e.target.files?.length) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors cursor-pointer"
        >
          <input
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload size={32} className="mx-auto text-slate-400 mb-2" />
            <p className="text-sm text-slate-600">拖拽文件到此处或点击上传</p>
            <p className="text-xs text-slate-400 mt-1">支持部署包、配置文件、测试报告等</p>
          </label>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between bg-slate-50 rounded-lg p-3 border border-slate-200"
            >
              <div className="flex items-center gap-3">
                <File size={20} className="text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700">{attachment.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(attachment.size)} · {formatDateTime(attachment.uploadedAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="p-1.5 rounded hover:bg-slate-200 transition-colors"
                  title="下载"
                >
                  <Download size={16} className="text-slate-600" />
                </button>
                {!readOnly && onRemove && (
                  <button
                    onClick={() => onRemove(attachment.id)}
                    className="p-1.5 rounded hover:bg-red-100 transition-colors"
                    title="删除"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}