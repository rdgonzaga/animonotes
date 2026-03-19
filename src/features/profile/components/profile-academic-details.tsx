'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const COLLEGES = ['BAGCED', 'CCS', 'TDSOL', 'CLA', 'COS', 'GCOE', 'COB', 'SOE'] as const;

type CollegeValue = (typeof COLLEGES)[number];

interface ProfileAcademicDetailsProps {
  userId: string;
  canEdit: boolean;
  initialCollege: string | null;
  initialCourse: string | null;
  initialUsername: string | null;
  initialBiography: string | null;
}

export function ProfileAcademicDetails({
  userId,
  canEdit,
  initialCollege,
  initialCourse,
  initialUsername,
  initialBiography,
}: ProfileAcademicDetailsProps) {
  const router = useRouter();
  const initialUsernameValue = (initialUsername || '').toLowerCase();
  const [college, setCollege] = useState<string>(initialCollege || '');
  const [course, setCourse] = useState<string>(initialCourse || '');
  const [username, setUsername] = useState<string>(initialUsernameValue);
  const [biography, setBiography] = useState<string>(initialBiography || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'unchecked' | 'available' | 'taken'>(
    initialUsernameValue ? 'available' : 'unchecked'
  );
  const [usernameMessage, setUsernameMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const normalizedUsername = username.trim().toLowerCase();
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;

  const isCollegeValue = (value: string): value is CollegeValue => {
    return COLLEGES.includes(value as CollegeValue);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!college || !course.trim() || !normalizedUsername) {
      setError('College, course, and username are required.');
      return;
    }

    if (!usernameRegex.test(normalizedUsername)) {
      setError('Username must be 3-30 characters and only use letters, numbers, and underscores.');
      return;
    }

    const changedUsername = normalizedUsername !== initialUsernameValue;
    if (changedUsername && usernameStatus !== 'available') {
      setError('Please check username availability first.');
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          college,
          course: course.trim(),
          username: normalizedUsername,
          biography: biography.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save profile details');
        setIsSaving(false);
        return;
      }

      setSuccess('Profile details saved.');
      setUsernameStatus('available');
      setUsernameMessage('Username is available.');
      router.refresh();
      router.replace(`/profile/${normalizedUsername}`);
    } catch {
      setError('Failed to save profile details');
    } finally {
      setIsSaving(false);
    }
  };

  const checkUsernameAvailability = async () => {
    setError('');
    setSuccess('');
    setUsernameMessage('');

    if (!normalizedUsername) {
      setUsernameStatus('unchecked');
      setUsernameMessage('Enter a username first.');
      return;
    }

    if (!usernameRegex.test(normalizedUsername)) {
      setUsernameStatus('taken');
      setUsernameMessage(
        'Username must be 3-30 characters and only use letters, numbers, and underscores.'
      );
      return;
    }

    setIsCheckingUsername(true);

    try {
      const res = await fetch(
        `/api/users/username-availability?username=${encodeURIComponent(normalizedUsername)}&excludeUserId=${encodeURIComponent(userId)}`,
        { cache: 'no-store' }
      );
      const data = await res.json();

      if (!res.ok) {
        setUsernameStatus('taken');
        setUsernameMessage(data.message || data.error || 'Unable to check username right now.');
        return;
      }

      if (data.available) {
        setUsernameStatus('available');
        setUsernameMessage('Username is available.');
      } else {
        setUsernameStatus('taken');
        setUsernameMessage('Username is already taken.');
      }
    } catch {
      setUsernameStatus('taken');
      setUsernameMessage('Unable to check username right now.');
    } finally {
      setIsCheckingUsername(false);
    }
  };

  if (!canEdit) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <h2 className="text-xl font-semibold">Profile Details</h2>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="text-muted-foreground">College</p>
            <p className="font-medium">{initialCollege || 'Not set'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Course</p>
            <p className="font-medium">{initialCourse || 'Not set'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Username</p>
            <p className="font-medium">{initialUsername || 'Not set'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Biography</p>
            <p className="font-medium whitespace-pre-wrap">
              {initialBiography || 'No biography yet'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <h2 className="text-xl font-semibold">Profile Details</h2>
        <p className="text-sm text-muted-foreground">
          Complete your academic and profile information.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="college">College *</Label>
            <p className="text-xs text-muted-foreground">
              Select what college you are currently enrolled at.
            </p>
            <Select
              value={isCollegeValue(college) ? college : undefined}
              onValueChange={(value) => setCollege(value)}
            >
              <SelectTrigger id="college">
                <SelectValue placeholder="Select your college" />
              </SelectTrigger>
              <SelectContent>
                {COLLEGES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course">Course *</Label>
            <p className="text-xs text-muted-foreground">
              Provide your full course name that is seen on your flowchart.
            </p>
            <Input
              id="course"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="e.g., BS Computer Science"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <p className="text-xs text-muted-foreground">Customize your username</p>
            <div className="flex items-center gap-2">
              <Input
                id="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameStatus('unchecked');
                  setUsernameMessage('');
                }}
                placeholder="e.g., reniaarr"
                required
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => void checkUsernameAvailability()}
                disabled={isCheckingUsername}
              >
                {isCheckingUsername ? 'Checking...' : 'Check'}
              </Button>
            </div>
            {usernameMessage && (
              <p
                className={`text-xs ${
                  usernameStatus === 'available'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {usernameMessage}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="biography">Biography</Label>
            <p className="text-xs text-muted-foreground">
              Feel free to share anything about yourself!
            </p>
            <Textarea
              id="biography"
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              placeholder="Type your biography here"
              maxLength={500}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}

          {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}

          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
