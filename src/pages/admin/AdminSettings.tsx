import { fetchSettings, updateSettings } from '@/api/admin';

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await fetchSettings();
        setSettings(data);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      await updateSettings(settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  return (
    <AdminLayout>
      {settings && (
        <div>
          <label>
            Quiz Timer (seconds):
            <input 
              type="number" 
              value={settings.quizTimer}
              onChange={(e) => setSettings({
                ...settings,
                quizTimer: parseInt(e.target.value)
              })}
            />
          </label>
          <button onClick={handleSave}>Save</button>
        </div>
      )}
    </AdminLayout>
  );
}
