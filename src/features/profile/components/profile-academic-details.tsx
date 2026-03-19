'use client';

import { useState } from 'react';
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
  const [college, setCollege] = useState<string>(initialCollege || '');
  const [course, setCourse] = useState<string>(initialCourse || '');
  const [username, setUsername] = useState<string>(initialUsername || '');
  const [biography, setBiography] = useState<string>(initialBiography || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isCollegeValue = (value: string): value is CollegeValue => {
    return COLLEGES.includes(value as CollegeValue);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!college || !course.trim() || !username.trim()) {
      setError('College, course, and username are required.');
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
          username: username.trim(),
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
    } catch {
      setError('Failed to save profile details');
    } finally {
      setIsSaving(false);
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
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., reniaarr"
              required
            />
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
