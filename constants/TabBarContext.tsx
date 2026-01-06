import React, { createContext, useContext, useRef } from 'react';
import { Animated } from 'react-native';

interface TabBarContextType {
    scrollY: Animated.Value;
    lastScrollY: React.MutableRefObject<number>;
    tabBarTranslateY: Animated.Value;
}

const TabBarContext = createContext<TabBarContextType | undefined>(undefined);

export const TabBarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const scrollY = useRef(new Animated.Value(0)).current;
    const lastScrollY = useRef(0);
    const tabBarTranslateY = useRef(new Animated.Value(0)).current;

    return (
        <TabBarContext.Provider value={{ scrollY, lastScrollY, tabBarTranslateY }}>
            {children}
        </TabBarContext.Provider>
    );
};

export const useTabBar = () => {
    const context = useContext(TabBarContext);
    if (!context) {
        throw new Error('useTabBar must be used within TabBarProvider');
    }
    return context;
};
