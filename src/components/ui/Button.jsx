import Button from './components/ui/Button';

function App() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">My UI Components Test</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Buttons:</h2>
        <div className="flex gap-4">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="danger">Danger Button</Button>
          <Button variant="success">Success Button</Button>
        </div>

        <h2 className="text-xl font-semibold mt-8">Disabled Button:</h2>
        <Button variant="primary" disabled>Disabled Button</Button>
      </div>
    </div>
  );
}

export default App;