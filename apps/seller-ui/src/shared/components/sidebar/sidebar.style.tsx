import styled, { css } from 'styled-components';
import Link from 'next/link';

export const SidebarWrapper = styled.aside`
  width: 280px;
  height: 100vh;
  background: #0a0a0c;
  color: #fff;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
`;

export const SidebarHeader = styled.div`
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

export const Logo = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #0085ff 0%, #0066cc 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 20px;
  color: white;
  box-shadow: 0 6px 12px rgba(0, 133, 255, 0.15);
`;

export const AdminInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const AdminName = styled.span`
  font-weight: 600;
  font-size: 15px;
  color: white;
  margin-bottom: 4px;
`;

export const AdminEmail = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
`;

export const SidebarBody = styled.div`
  flex: 1;
  padding: 24px 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 28px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 4px;
  }
`;

export const SidebarMenu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const MenuTitle = styled.span`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.3);
  padding: 0 12px;
  margin-bottom: 4px;
`;

export const MenuItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

interface SidebarItemProps {
  $isActive?: boolean;
}

export const SidebarItemLink = styled(Link)<SidebarItemProps>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  color: #969696;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  background: transparent;

  svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
    transition: fill 0.2s ease;
  }

  ${({ $isActive }) =>
    $isActive &&
    css`
      background: rgba(0, 133, 255, 0.08);
      color: #0085ff;
      font-weight: 600;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        height: 20px;
        width: 3px;
        background: #0085ff;
        border-radius: 0 4px 4px 0;
        box-shadow: 0 0 8px rgba(0, 133, 255, 0.4);
      }
    `}

  &:active {
    background: rgba(0, 133, 255, 0.15);
    transform: scale(0.96);
  }

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    color: white;
  }
`;
