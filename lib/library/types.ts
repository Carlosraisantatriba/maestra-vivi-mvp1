export const SUBJECT_OPTIONS = [
  { value: "math", label: "Matemática" },
  { value: "language", label: "Lengua" },
  { value: "english", label: "Inglés" }
] as const;

export const LIBRARY_TYPE_OPTIONS = [
  { value: "tarea", label: "Tarea" },
  { value: "lectura", label: "Lectura" },
  { value: "dictado", label: "Dictado" },
  { value: "practica", label: "Práctica" }
] as const;

export type SubjectValue = (typeof SUBJECT_OPTIONS)[number]["value"];
export type LibraryTypeValue = (typeof LIBRARY_TYPE_OPTIONS)[number]["value"];

export type LibraryListItem = {
  id: string;
  title: string;
  subject: SubjectValue;
  week_number: number;
  type: LibraryTypeValue;
  file_type: string;
  ingestion_status: string;
  created_at: string;
};
