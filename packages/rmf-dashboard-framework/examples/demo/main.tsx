import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import ReactDOM from 'react-dom/client';
import {
  InitialWindow,
  MissionDashboard,
  RmfDashboard,
  Workspace,
} from 'rmf-dashboard-framework/components';
import { createMapApp, robotsApp, tasksApp } from 'rmf-dashboard-framework/micro-apps';
import { StubAuthenticator } from 'rmf-dashboard-framework/services';

const mapConfig = {
  attributionPrefix: 'Open-RMF',
  defaultMapLevel: 'LG',
  defaultRobotZoom: 20,
  defaultZoom: 20,
};

const mapApp = createMapApp(mapConfig);

const homeWorkspace: InitialWindow[] = [
  {
    layout: { x: 0, y: 0, w: 12, h: 6 },
    microApp: mapApp,
  },
];

const robotsWorkspace: InitialWindow[] = [
  {
    layout: { x: 0, y: 0, w: 7, h: 4 },
    microApp: robotsApp,
  },
  { layout: { x: 7, y: 0, w: 5, h: 8 }, microApp: mapApp },
];

const tasksWorkspace: InitialWindow[] = [
  { layout: { x: 0, y: 0, w: 7, h: 8 }, microApp: tasksApp },
  { layout: { x: 7, y: 0, w: 5, h: 8 }, microApp: mapApp },
];

export default function App() {
  return (
    <RmfDashboard
      apiServerUrl="http://localhost:8000"
      trajectoryServerUrl="http://localhost:8006"
      authenticator={new StubAuthenticator()}
      helpLink="https://osrf.github.io/ros2multirobotbook/rmf-core.html"
      reportIssueLink="https://github.com/open-rmf/rmf-web/issues"
      resources={{ fleets: {}, logos: { header: '/resources/defaultLogo.png' } }}
      tasks={{
        allowedTasks: [
          { taskDefinitionId: 'patrol' },
          { taskDefinitionId: 'delivery' },
          { taskDefinitionId: 'compose-clean' },
          { taskDefinitionId: 'custom_compose' },
        ],
        pickupZones: [],
        cartIds: [],
      }}
      tabs={[
        {
          name: 'Map',
          route: '',
          element: <Workspace initialWindows={homeWorkspace} />,
        },
        {
          name: 'Robots',
          route: 'robots',
          element: <Workspace initialWindows={robotsWorkspace} />,
        },
        {
          name: 'Tasks',
          route: 'tasks',
          element: <Workspace initialWindows={tasksWorkspace} />,
        },
        {
          name: 'Mission',
          route: 'mission',
          element: <MissionDashboard mapConfig={mapConfig} />,
        },
      ]}
    />
  );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
