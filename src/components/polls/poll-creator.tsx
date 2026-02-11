"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus } from "lucide-react";

interface PollCreatorProps {
  onPollDataChange: (pollData: {
    question: string;
    options: string[];
    endsAt?: string;
  } | null) => void;
}

export function PollCreator({ onPollDataChange }: PollCreatorProps) {
  const [enabled, setEnabled] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [endsAt, setEndsAt] = useState("");

  const handleToggle = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    
    if (newEnabled) {
      onPollDataChange({
        question,
        options: options.filter(opt => opt.trim()),
        endsAt: endsAt || undefined,
      });
    } else {
      onPollDataChange(null);
    }
  };

  const handleQuestionChange = (value: string) => {
    setQuestion(value);
    if (enabled) {
      onPollDataChange({
        question: value,
        options: options.filter(opt => opt.trim()),
        endsAt: endsAt || undefined,
      });
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    
    if (enabled) {
      onPollDataChange({
        question,
        options: newOptions.filter(opt => opt.trim()),
        endsAt: endsAt || undefined,
      });
    }
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      
      if (enabled) {
        onPollDataChange({
          question,
          options: newOptions.filter(opt => opt.trim()),
          endsAt: endsAt || undefined,
        });
      }
    }
  };

  const handleEndsAtChange = (value: string) => {
    setEndsAt(value);
    if (enabled) {
      onPollDataChange({
        question,
        options: options.filter(opt => opt.trim()),
        endsAt: value || undefined,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="enable-poll"
          checked={enabled}
          onChange={handleToggle}
          className="h-4 w-4"
        />
        <Label htmlFor="enable-poll" className="cursor-pointer">
          Add a poll to this post
        </Label>
      </div>

      {enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Poll</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="poll-question">Question</Label>
              <Input
                id="poll-question"
                value={question}
                onChange={(e) => handleQuestionChange(e.target.value)}
                placeholder="What's your question?"
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label>Options (2-10)</Label>
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    maxLength={100}
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {options.length < 10 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              )}
            </div>

            <div>
              <Label htmlFor="poll-ends-at">End Date (Optional)</Label>
              <Input
                id="poll-ends-at"
                type="datetime-local"
                value={endsAt}
                onChange={(e) => handleEndsAtChange(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
