import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ExampleMeta } from '@/examples/types'

interface ExampleState {
  currentExample: ExampleMeta | null
  activeFile: string
  userEdits: Record<string, Record<string, string>>
  setCurrentExample: (example: ExampleMeta | null) => void
  setActiveFile: (filename: string) => void
  updateFileContent: (exampleId: string, filename: string, content: string) => void
  resetFileEdits: (exampleId: string) => void
  getMergedFiles: () => Record<string, string>
}

export const useExampleStore = create<ExampleState>()(
  persist(
    (set, get) => ({
      currentExample: null,
      activeFile: 'main.ts',
      userEdits: {},

      setCurrentExample: (example) =>
        set({
          currentExample: example,
          activeFile: example ? Object.keys(example.files)[0] ?? 'main.ts' : 'main.ts',
        }),

      setActiveFile: (filename) => set({ activeFile: filename }),

      updateFileContent: (exampleId, filename, content) =>
        set((state) => ({
          userEdits: {
            ...state.userEdits,
            [exampleId]: {
              ...(state.userEdits[exampleId] ?? {}),
              [filename]: content,
            },
          },
        })),

      resetFileEdits: (exampleId) =>
        set((state) => {
          const { [exampleId]: _, ...rest } = state.userEdits
          return { userEdits: rest }
        }),

      getMergedFiles: () => {
        const { currentExample, userEdits } = get()
        if (!currentExample) return {}
        const edits = userEdits[currentExample.id] ?? {}
        return { ...currentExample.files, ...edits }
      },
    }),
    {
      name: 'cesium-example-edits',
      partialize: (state) => ({ userEdits: state.userEdits }),
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
