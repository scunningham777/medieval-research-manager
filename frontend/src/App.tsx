import { SourceList } from './components/SourceList';
import './App.css';

export function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Medieval Research Manager</h1>
      </header>
      <main className="app-main">
        <SourceList />
      </main>
    </div>
  );
}
