import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: ${props => props.isSidebarOpen ? '240px 1fr' : '64px 1fr'};
  min-height: 100vh;
  background-color: ${theme.colors.background};
  transition: grid-template-columns 0.3s ease;

  @media (max-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.main`
  padding: ${theme.spacing.xl};
  overflow-y: auto;
`;

const DashboardHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: ${theme.colors.surface};
  box-shadow: ${theme.shadows.card};
`;

const CommandBar = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  padding: ${theme.spacing.sm};
  background: ${theme.colors.surface};
  border-bottom: 1px solid rgba(0,0,0,0.1);
`;

export const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <DashboardContainer isSidebarOpen={isSidebarOpen}>
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div>
        <DashboardHeader>
          <CommandBar>
            {/* Command bar implementation */}
          </CommandBar>
        </DashboardHeader>
        <MainContent>
          {children}
        </MainContent>
      </div>
    </DashboardContainer>
  );
};

const Sidebar = styled.nav`
  background: ${theme.colors.surface};
  box-shadow: ${theme.shadows.card};
  transition: width 0.3s ease;
  width: ${props => props.isOpen ? '240px' : '64px'};
  overflow: hidden;
`;
