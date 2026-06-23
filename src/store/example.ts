import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ExampleMeta } from '@/examples/types'

const getExampleFilesSignature = (files: ExampleMeta['files']) => JSON.stringify(files)

interface ExampleState {
  currentExample: ExampleMeta | null
  activeFile: string
  userEdits: Record<string, Record<string, string>>
  editBaseSignatures: Record<string, string>
  setCurrentExample: (example: ExampleMeta | null) => void
  setActiveFile: (filename: string) => void
  updateFileContent: (exampleId: string, filename: string, content: string, sourceSignature: string) => void
  resetFileEdits: (exampleId: string) => void
  getMergedFiles: () => Record<string, string>
}

export const useExampleStore = create<ExampleState>()(
  persist(
    (set, get) => ({
      currentExample: null,
      activeFile: 'main.ts',
      userEdits: {},
      editBaseSignatures: {},

      setCurrentExample: (example) =>
        set({
          currentExample: example,
          activeFile: example ? Object.keys(example.files)[0] ?? 'main.ts' : 'main.ts',
        }),

      setActiveFile: (filename) => set({ activeFile: filename }),

      updateFileContent: (exampleId, filename, content, sourceSignature) =>
        set((state) => ({
          userEdits: {
            ...state.userEdits,
            [exampleId]: {
              ...(state.userEdits[exampleId] ?? {}),
              [filename]: content,
            },
          },
          editBaseSignatures: {
            ...state.editBaseSignatures,
            [exampleId]: sourceSignature,
          },
        })),

      resetFileEdits: (exampleId) =>
        set((state) => {
          const rest = { ...state.userEdits }
          const signatureRest = { ...state.editBaseSignatures }
          delete rest[exampleId]
          delete signatureRest[exampleId]
          return { userEdits: rest, editBaseSignatures: signatureRest }
        }),

      getMergedFiles: () => {
        const { currentExample, userEdits, editBaseSignatures } = get()
        if (!currentExample) return {}
        const currentSignature = getExampleFilesSignature(currentExample.files)
        if (editBaseSignatures[currentExample.id] !== currentSignature) {
          return currentExample.files
        }
        const edits = userEdits[currentExample.id] ?? {}
        return { ...currentExample.files, ...edits }
      },
    }),
    {
      name: 'cesium-example-edits',
      partialize: (state) => ({
        userEdits: state.userEdits,
        editBaseSignatures: state.editBaseSignatures,
      }),
    }
  )
)

interface ExampleListState {
  searchKeyword: string
  activeCategory: string
  setSearchKeyword: (kw: string) => void
  setActiveCategory: (cat: string) => void
}

export const useExampleListStore = create<ExampleListState>()((set) => ({
  searchKeyword: '',
  activeCategory: '全部',
  setSearchKeyword: (kw) => set({ searchKeyword: kw }),
  setActiveCategory: (cat) => set({ activeCategory: cat }),
}))
