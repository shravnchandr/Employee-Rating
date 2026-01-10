import React, { useState, useEffect } from 'react';
import type { Employee, Rating } from './types';
import { LoginView } from './components/auth/LoginView';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { RatingView } from './components/rating/RatingView';
import { api } from './services/api';

const EmployeeRatingApp = () => {
  const [view, setView] = useState('login');
  const [adminPassword, setAdminPassword] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [categories, setCategories] = useState<string[]>(['Teamwork', 'Communication', 'Quality of Work', 'Reliability']);

  // Admin states
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeePhoto, setNewEmployeePhoto] = useState('');

  // Employee rating states
  const [currentRater, setCurrentRater] = useState<Employee | null>(null);
  const [isAdminRating, setIsAdminRating] = useState(false);
  const [currentRatingIndex, setCurrentRatingIndex] = useState(0);
  const [currentRatings, setCurrentRatings] = useState<Record<number, Record<string, string>>>({});
  const [currentFeedbacks, setCurrentFeedbacks] = useState<Record<number, string>>({});

  // Animations & UI States
  const [animating, setAnimating] = useState(false);

  // New Views State
  const [viewTrendsFor, setViewTrendsFor] = useState<number | null>(null);
  const [viewHistoryFor, setViewHistoryFor] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await api.fetchData();
      if (data.employees) setEmployees(data.employees);
      if (data.ratings) setRatings(data.ratings);
      if (data.categories) setCategories(data.categories);
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const saveData = async () => {
    try {
      await api.saveData({
        employees,
        ratings,
        categories
      });
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  useEffect(() => {
    // Only save if there is data to save, and maybe debounce this in a real app
    // For now, we check if data is loaded to avoid overwriting with empty state on initial load
    // A simple check is if we have any employees or ratings, OR if we know data loading is done.
    // Since we don't have a loading state, we'll stick to the previous logic but be careful.
    if (employees.length > 0 || ratings.length > 0) {
      saveData();
    }
  }, [employees, ratings, categories]);

  const handleAdminLogin = () => {
    if (adminPassword === 'admin123') {
      setView('admin');
      setAdminPassword('');
    } else {
      alert('Incorrect password');
    }
  };

  const startRatingForEmployee = (employee: Employee) => {
    setCurrentRater(employee);
    setIsAdminRating(false);
    setView('employee');
    setCurrentRatingIndex(0);
    setCurrentRatings({});
    setCurrentFeedbacks({});
  };

  const startAdminRating = () => {
    setIsAdminRating(true);
    setView('adminRating');
    setCurrentRatingIndex(0);
    setCurrentRatings({});
    setCurrentFeedbacks({});
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Photo size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => setNewEmployeePhoto(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generateAvatar = (name: string) => {
    const colors = ['bg-[#0277BD]', 'bg-[#00897B]', 'bg-[#00ACC1]', 'bg-[#0288D1]', 'bg-[#00796B]'];
    return colors[name.length % colors.length];
  };

  const addEmployee = () => {
    if (newEmployeeName.trim()) {
      const newEmp: Employee = {
        id: Date.now(),
        name: newEmployeeName.trim(),
        photo: newEmployeePhoto || null,
        avatar: generateAvatar(newEmployeeName)
      };
      setEmployees([...employees, newEmp]);
      setNewEmployeeName('');
      setNewEmployeePhoto('');
    }
  };

  const removeEmployee = (id: number) => {
    if (confirm('Are you sure you want to remove this employee?')) {
      setEmployees(employees.filter(e => e.id !== id));
      setRatings(ratings.filter(r => r.ratedEmployeeId !== id && r.raterId !== id));
    }
  };

  const employeesToRate = isAdminRating ? employees : employees.filter(e => e.id !== currentRater?.id);

  const submitCategoryRating = (category: string, value: string) => {
    const employeeToRate = employeesToRate[currentRatingIndex];
    const newRatings = { ...currentRatings };
    if (!newRatings[employeeToRate.id]) newRatings[employeeToRate.id] = {};
    newRatings[employeeToRate.id][category] = value;
    setCurrentRatings(newRatings);
  };

  const submitFeedback = (value: string) => {
    const employeeToRate = employeesToRate[currentRatingIndex];
    setCurrentFeedbacks({
      ...currentFeedbacks,
      [employeeToRate.id]: value
    });
  };

  const goToNextEmployee = () => {
    const employeeToRate = employeesToRate[currentRatingIndex];
    const hasAllRatings = categories.every(cat => currentRatings[employeeToRate.id]?.[cat]);

    if (!hasAllRatings) {
      alert('Please rate all categories before proceeding');
      return;
    }

    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
      if (currentRatingIndex < employeesToRate.length - 1) {
        setCurrentRatingIndex(currentRatingIndex + 1);
      } else {
        saveAllRatings(currentRatings);
      }
    }, 300);
  };

  const saveAllRatings = (ratingsToSave: Record<number, Record<string, string>>) => {
    const newRatingEntries: Rating[] = [];
    Object.keys(ratingsToSave).forEach(employeeIdStr => {
      const employeeId = parseInt(employeeIdStr);
      Object.keys(ratingsToSave[employeeId]).forEach(category => {
        newRatingEntries.push({
          id: Date.now() + Math.random(),
          raterId: isAdminRating ? 'admin' : currentRater!.id,
          raterName: isAdminRating ? 'Admin' : currentRater!.name,
          isAdminRating: isAdminRating,
          ratedEmployeeId: employeeId,
          category: category,
          rating: ratingsToSave[employeeId][category],
          feedback: currentFeedbacks[employeeId],
          timestamp: new Date().toISOString()
        });
      });
    });

    setRatings([...ratings, ...newRatingEntries]);
    setView('admin');
    setCurrentRater(null);
    setIsAdminRating(false);
    setCurrentRatings({});
    setCurrentFeedbacks({});
    setCurrentRatingIndex(0);
  };

  if (view === 'login') {
    return (
      <LoginView
        adminPassword={adminPassword}
        setAdminPassword={setAdminPassword}
        handleAdminLogin={handleAdminLogin}
      />
    );
  }

  if (view === 'admin') {
    return (
      <AdminDashboard
        employees={employees}
        ratings={ratings}
        newEmployeeName={newEmployeeName}
        setNewEmployeeName={setNewEmployeeName}
        newEmployeePhoto={newEmployeePhoto}
        handlePhotoUpload={handlePhotoUpload}
        addEmployee={addEmployee}
        removeEmployee={removeEmployee}
        startAdminRating={startAdminRating}
        startRatingForEmployee={startRatingForEmployee}
        onLogout={() => setView('login')}
        viewTrendsFor={viewTrendsFor}
        setViewTrendsFor={setViewTrendsFor}
        viewHistoryFor={viewHistoryFor}
        setViewHistoryFor={setViewHistoryFor}
      />
    );
  }

  if (view === 'employee' || view === 'adminRating') {
    return (
      <RatingView
        employeesToRate={employeesToRate}
        currentRatingIndex={currentRatingIndex}
        currentRatings={currentRatings}
        categories={categories}
        isAdminRating={isAdminRating}
        animating={animating}
        submitCategoryRating={submitCategoryRating}
        submitFeedback={submitFeedback}
        currentFeedbacks={currentFeedbacks}
        goToNextEmployee={goToNextEmployee}
        saveData={saveData}
        onExit={() => setView('admin')}
      />
    );
  }

  return null;
};

export default EmployeeRatingApp;