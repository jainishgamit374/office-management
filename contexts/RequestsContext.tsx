import React, { createContext, ReactNode, useContext, useState } from 'react';

// Types
export type LeaveType = 'Casual Leave' | 'Sick Leave' | 'Privilege Leave' | 'Leave Without Pay';
export type TimeOffType = 'Early Check-Out' | 'Late Check-In';
export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
    id: string;
    employeeName: string;
    employeeId: string;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: RequestStatus;
    submittedOn: string;
}

export interface TimeOffRequest {
    id: string;
    employeeName: string;
    employeeId: string;
    type: TimeOffType;
    date: string;
    time: string;
    reason: string;
    status: RequestStatus;
    submittedOn: string;
}

export interface WFHRequest {
    id: string;
    employeeName: string;
    employeeId: string;
    date: string;
    isHalfDay: boolean;
    reason: string;
    status: RequestStatus;
    submittedOn: string;
}

export interface MissPunchRequest {
    id: string;
    employeeName: string;
    employeeId: string;
    date: string;
    punchType: 'In' | 'Out';
    actualTime: string;
    reason: string;
    status: RequestStatus;
    submittedOn: string;
}

interface RequestsContextType {
    leaveRequests: LeaveRequest[];
    timeOffRequests: TimeOffRequest[];
    wfhRequests: WFHRequest[];
    missPunchRequests: MissPunchRequest[];
    addLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'submittedOn' | 'status'>) => void;
    addTimeOffRequest: (request: Omit<TimeOffRequest, 'id' | 'submittedOn' | 'status'>) => void;
    addWFHRequest: (request: Omit<WFHRequest, 'id' | 'submittedOn' | 'status'>) => void;
    addMissPunchRequest: (request: Omit<MissPunchRequest, 'id' | 'submittedOn' | 'status'>) => void;
    updateLeaveStatus: (id: string, status: RequestStatus) => void;
    updateTimeOffStatus: (id: string, status: RequestStatus) => void;
    updateWFHStatus: (id: string, status: RequestStatus) => void;
    updateMissPunchStatus: (id: string, status: RequestStatus) => void;
}

const RequestsContext = createContext<RequestsContextType | undefined>(undefined);

// Initial mock data
const initialLeaveRequests: LeaveRequest[] = [
    {
        id: '1',
        employeeName: 'John Doe',
        employeeId: 'EMP001',
        leaveType: 'Sick Leave',
        startDate: '2025-12-20',
        endDate: '2025-12-22',
        days: 3,
        reason: 'Suffering from viral fever and need rest',
        status: 'Pending',
        submittedOn: '2025-12-18',
    },
    {
        id: '2',
        employeeName: 'Jane Smith',
        employeeId: 'EMP002',
        leaveType: 'Casual Leave',
        startDate: '2025-12-25',
        endDate: '2025-12-27',
        days: 3,
        reason: 'Family function - cousin\'s wedding',
        status: 'Approved',
        submittedOn: '2025-12-17',
    },
];

const initialTimeOffRequests: TimeOffRequest[] = [
    {
        id: '1',
        employeeName: 'John Doe',
        employeeId: 'EMP001',
        type: 'Early Check-Out',
        date: '2025-12-18',
        time: '17:30',
        reason: 'Doctor appointment scheduled at 6:00 PM',
        status: 'Pending',
        submittedOn: '2025-12-17',
    },
    {
        id: '2',
        employeeName: 'Jane Smith',
        employeeId: 'EMP002',
        type: 'Late Check-In',
        date: '2025-12-19',
        time: '10:30',
        reason: 'Car breakdown on the way to office',
        status: 'Approved',
        submittedOn: '2025-12-17',
    },
];

const initialWFHRequests: WFHRequest[] = [
    {
        id: '1',
        employeeName: 'Mike Johnson',
        employeeId: 'EMP003',
        date: '2025-12-20',
        isHalfDay: false,
        reason: 'Internet installation at home',
        status: 'Pending',
        submittedOn: '2025-12-18',
    },
];

const initialMissPunchRequests: MissPunchRequest[] = [
    {
        id: '1',
        employeeName: 'Sarah Williams',
        employeeId: 'EMP004',
        date: '2025-12-17',
        punchType: 'Out',
        actualTime: '18:30',
        reason: 'Forgot to punch out due to urgent meeting',
        status: 'Pending',
        submittedOn: '2025-12-18',
    },
];

export const RequestsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
    const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>(initialTimeOffRequests);
    const [wfhRequests, setWFHRequests] = useState<WFHRequest[]>(initialWFHRequests);
    const [missPunchRequests, setMissPunchRequests] = useState<MissPunchRequest[]>(initialMissPunchRequests);

    const generateId = () => Date.now().toString();
    const getCurrentDate = () => new Date().toISOString().split('T')[0];

    const addLeaveRequest = (request: Omit<LeaveRequest, 'id' | 'submittedOn' | 'status'>) => {
        const newRequest: LeaveRequest = {
            ...request,
            id: generateId(),
            status: 'Pending',
            submittedOn: getCurrentDate(),
        };
        setLeaveRequests((prev) => [newRequest, ...prev]);
    };

    const addTimeOffRequest = (request: Omit<TimeOffRequest, 'id' | 'submittedOn' | 'status'>) => {
        const newRequest: TimeOffRequest = {
            ...request,
            id: generateId(),
            status: 'Pending',
            submittedOn: getCurrentDate(),
        };
        setTimeOffRequests((prev) => [newRequest, ...prev]);
    };

    const addWFHRequest = (request: Omit<WFHRequest, 'id' | 'submittedOn' | 'status'>) => {
        const newRequest: WFHRequest = {
            ...request,
            id: generateId(),
            status: 'Pending',
            submittedOn: getCurrentDate(),
        };
        setWFHRequests((prev) => [newRequest, ...prev]);
    };

    const addMissPunchRequest = (request: Omit<MissPunchRequest, 'id' | 'submittedOn' | 'status'>) => {
        const newRequest: MissPunchRequest = {
            ...request,
            id: generateId(),
            status: 'Pending',
            submittedOn: getCurrentDate(),
        };
        setMissPunchRequests((prev) => [newRequest, ...prev]);
    };

    const updateLeaveStatus = (id: string, status: RequestStatus) => {
        setLeaveRequests((prev) =>
            prev.map((req) => (req.id === id ? { ...req, status } : req))
        );
    };

    const updateTimeOffStatus = (id: string, status: RequestStatus) => {
        setTimeOffRequests((prev) =>
            prev.map((req) => (req.id === id ? { ...req, status } : req))
        );
    };

    const updateWFHStatus = (id: string, status: RequestStatus) => {
        setWFHRequests((prev) =>
            prev.map((req) => (req.id === id ? { ...req, status } : req))
        );
    };

    const updateMissPunchStatus = (id: string, status: RequestStatus) => {
        setMissPunchRequests((prev) =>
            prev.map((req) => (req.id === id ? { ...req, status } : req))
        );
    };

    return (
        <RequestsContext.Provider
            value={{
                leaveRequests,
                timeOffRequests,
                wfhRequests,
                missPunchRequests,
                addLeaveRequest,
                addTimeOffRequest,
                addWFHRequest,
                addMissPunchRequest,
                updateLeaveStatus,
                updateTimeOffStatus,
                updateWFHStatus,
                updateMissPunchStatus,
            }}
        >
            {children}
        </RequestsContext.Provider>
    );
};

export const useRequests = () => {
    const context = useContext(RequestsContext);
    if (context === undefined) {
        throw new Error('useRequests must be used within a RequestsProvider');
    }
    return context;
};
