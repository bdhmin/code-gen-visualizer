'use client';

import { SplitView } from './components/panels/SplitView';
import { ConversationPanel } from './components/ConversationPanel';
import { SandboxPanel } from './components/SandboxPanel';
import { CodeRepresentationViewPanel } from './components/CodeRepresentationViewPanel';
import { useGeneration } from './hooks/useGeneration';

export default function Home() {
  const {
    messages,
    componentCode,
    visualizationCode,
    isGenerating,
    isVisualizing,
    componentReady,
    visualizationReady,
    generate,
    isLoading,
  } = useGeneration();

  return (
    <div className="h-screen w-screen bg-zinc-950 overflow-hidden">
      <SplitView initialSizes={[25, 40, 35]}>
        {/* Panel 1: Conversation */}
        <ConversationPanel
          messages={messages}
          onSubmit={generate}
          isLoading={isLoading}
        />

        {/* Panel 2: Preview */}
        <SandboxPanel 
          code={componentCode} 
          title="Preview" 
          isStreaming={isGenerating}
          isReady={componentReady}
        />

        {/* Panel 3: Code / Code Representation Toggle */}
        <CodeRepresentationViewPanel
          componentCode={componentCode}
          visualizationCode={visualizationCode}
          isVisualizing={isVisualizing}
          visualizationReady={visualizationReady}
        />
      </SplitView>
    </div>
  );
}
