import React from 'react';
import { ShopOutlined } from '@ant-design/icons';
import './index.less';

interface LogoProps {
    size?: 'small' | 'medium' | 'large';
    showText?: boolean;
    className?: string;
}

const Logo: React.FC<LogoProps> = ({
    size = 'medium',
    showText = true,
    className = ''
}) => {
    const sizeClass = `logo-${size}`;

    return (
        <div className={`logo-container ${sizeClass} ${className}`}>
            <div className="logo-icon">
                <ShopOutlined />
            </div>
            {showText && (
                <div className="logo-text">
                    <div className="logo-title">闲余-后台管理系统</div>
                    <div className="logo-subtitle"></div>
                </div>
            )}
        </div>
    );
};

export default Logo;