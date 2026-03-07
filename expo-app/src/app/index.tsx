import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { api } from '@/utils/api';
import { Group, Survey, SurveyResult, User } from '@/types/api';

type SurveyMap = Record<string, Survey[]>;
type ResultMap = Record<string, SurveyResult>;

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [surveysByGroup, setSurveysByGroup] = useState<SurveyMap>({});
  const [resultsBySurvey, setResultsBySurvey] = useState<ResultMap>({});
  const [message, setMessage] = useState<string | null>(null);

  const students = useMemo(
    () => users.filter((u) => u.role === 'student'),
    [users]
  );

  const loadData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const [userList, groupList] = await Promise.all([
        api.get<User[]>('/users'),
        api.get<Group[]>('/groups')
      ]);
      setUsers(userList);
      setGroups(groupList);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const ensureUser = async (user: {
    name: string;
    email: string;
    role: 'teacher' | 'student';
  }) => {
    try {
      const created = await api.post<User>('/users', user);
      return created;
    } catch (err) {
      // Likely 409 conflict, try to find existing
      const existing = users.find((u) => u.email === user.email);
      if (existing) return existing;
      const refreshed = await api.get<User[]>('/users');
      setUsers(refreshed);
      const found = refreshed.find((u) => u.email === user.email);
      if (found) return found;
      throw err;
    }
  };

  const handleSeedDemo = async () => {
    setMessage('Creating demo data...');
    try {
      const teacher = await ensureUser({
        name: 'Demo Teacher',
        email: 'teacher@example.com',
        role: 'teacher'
      });
      const student = await ensureUser({
        name: 'Demo Student',
        email: 'student@example.com',
        role: 'student'
      });

      const group = await api.post<Group>('/groups', {
        name: 'Klasse 10A',
        teacherId: teacher._id,
        memberIds: [student._id]
      });

      const questions = [
        {
          prompt: 'Wie war der Unterricht?',
          type: 'multiple_choice',
          options: ['Super', 'Okay', 'Schwer']
        },
        {
          prompt: 'Wie fühlst du dich heute?',
          type: 'scale',
          scale: { min: 1, max: 5, step: 1 }
        },
        {
          prompt: 'Feedback (optional)',
          type: 'text'
        }
      ];

      await api.post<Survey>('/surveys', {
        title: 'Stimmungsbarometer',
        groupId: group._id,
        createdBy: teacher._id,
        anonymous: false,
        questions
      });

      await loadData();
      setMessage('Demo-Daten erstellt. Tippe auf Refresh, falls nötig.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Fehler beim Erstellen');
    }
  };

  const loadSurveysForGroup = async (groupId: string) => {
    try {
      const surveys = await api.get<Survey[]>(`/surveys/group/${groupId}`);
      setSurveysByGroup((prev) => ({ ...prev, [groupId]: surveys }));
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : 'Konnte Umfragen nicht laden'
      );
    }
  };

  const loadResults = async (surveyId: string) => {
    try {
      const results = await api.get<SurveyResult>(`/surveys/${surveyId}/results`);
      setResultsBySurvey((prev) => ({ ...prev, [surveyId]: results }));
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : 'Konnte Ergebnisse nicht laden'
      );
    }
  };

  const quickRespond = async (survey: Survey) => {
    const firstStudent = students[0];
    if (!survey.anonymous && !firstStudent) {
      setMessage('Bitte zuerst einen Schüler anlegen (Seed-Button).');
      return;
    }

    const answers = survey.questions.map((q) => {
      if (q.type === 'multiple_choice' && q.options && q.options.length > 0) {
        return { questionId: q._id, value: q.options[0] };
      }
      if (q.type === 'scale' && q.scale) {
        return { questionId: q._id, value: q.scale.min };
      }
      return { questionId: q._id, value: 'Demo Antwort' };
    });

    try {
      await api.post(`/surveys/${survey._id}/responses`, {
        userId: survey.anonymous ? undefined : firstStudent?._id,
        answers
      });
      setMessage('Antwort gespeichert.');
      await loadResults(survey._id);
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : 'Antwort konnte nicht gesendet werden'
      );
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <ThemedText type="title">Gruppen</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              API: {api.baseUrl}
            </ThemedText>
          </View>
          <View style={styles.headerButtons}>
            <PrimaryButton label="Refresh" onPress={loadData} />
            <SecondaryButton label="Seed Demo" onPress={handleSeedDemo} />
          </View>
        </View>

        {message && (
          <ThemedView type="backgroundElement" style={styles.messageBox}>
            <ThemedText>{message}</ThemedText>
          </ThemedView>
        )}

        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadData} />
          }>
          {loading && (
            <View style={styles.loader}>
              <ActivityIndicator />
              <ThemedText style={{ marginTop: Spacing.two }}>
                Laden...
              </ThemedText>
            </View>
          )}

          {!loading && groups.length === 0 && (
            <ThemedText type="subtitle">
              Noch keine Gruppen. Seed oder selbst anlegen.
            </ThemedText>
          )}

          {groups.map((group) => (
            <GroupCard
              key={group._id}
              group={group}
              surveys={surveysByGroup[group._id]}
              onLoadSurveys={() => loadSurveysForGroup(group._id)}
              onQuickRespond={quickRespond}
              onViewResults={loadResults}
              resultsBySurvey={resultsBySurvey}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const GroupCard = ({
  group,
  surveys,
  onLoadSurveys,
  onQuickRespond,
  onViewResults,
  resultsBySurvey
}: {
  group: Group;
  surveys?: Survey[];
  onLoadSurveys: () => void | Promise<void>;
  onQuickRespond: (survey: Survey) => void;
  onViewResults: (surveyId: string) => void | Promise<void>;
  resultsBySurvey: ResultMap;
}) => {
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="subtitle">{group.name}</ThemedText>
      <ThemedText themeColor="textSecondary">
        Lehrer: {group.teacher?.name ?? '–'}
      </ThemedText>

      <ThemedText style={{ marginTop: Spacing.two, marginBottom: Spacing.one }}>
        Mitglieder ({group.members?.length ?? 0})
      </ThemedText>
      <View style={styles.chipRow}>
        {group.members?.map((m) => (
          <Chip key={m._id} label={`${m.name} (${m.role})`} />
        ))}
      </View>

      <View style={styles.row}>
        <PrimaryButton label="Lade Umfragen" onPress={onLoadSurveys} />
        <SecondaryButton
          label="Neue Demo-Umfrage"
          onPress={async () => {
            await api.post<Survey>('/surveys', {
              title: 'Schnelle Umfrage',
              groupId: group._id,
              createdBy: group.teacher?._id,
              anonymous: false,
              questions: [
                {
                  prompt: 'Zufriedenheit?',
                  type: 'multiple_choice',
                  options: ['Gut', 'Mittel', 'Schlecht']
                },
                { prompt: 'Skala 1-5', type: 'scale', scale: { min: 1, max: 5 } },
                { prompt: 'Kommentar', type: 'text' }
              ]
            });
            await onLoadSurveys();
          }}
        />
      </View>

      {surveys && surveys.length > 0 && (
        <View style={{ marginTop: Spacing.three, gap: Spacing.two }}>
          {surveys.map((survey) => (
            <ThemedView
              key={survey._id}
              type="background"
              style={styles.surveyBox}>
              <ThemedText>{survey.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Fragen: {survey.questions.length} | Anonym: {survey.anonymous ? 'Ja' : 'Nein'}
              </ThemedText>
              <View style={styles.row}>
                <PrimaryButton
                  label="Schnell antworten"
                  onPress={() => onQuickRespond(survey)}
                />
                <SecondaryButton
                  label="Ergebnisse"
                  onPress={() => onViewResults(survey._id)}
                />
              </View>

              {resultsBySurvey[survey._id] && (
                <ResultsView result={resultsBySurvey[survey._id]} />
              )}
            </ThemedView>
          ))}
        </View>
      )}
    </ThemedView>
  );
};

const ResultsView = ({ result }: { result: SurveyResult }) => {
  return (
    <View style={{ marginTop: Spacing.two, gap: Spacing.one }}>
      <ThemedText type="smallBold">
        Antworten gesamt: {result.totalResponses}
      </ThemedText>
      {result.questions.map((q) => {
        let summary: React.ReactNode = null;
        if ('counts' in q.summary) {
          summary = (
            <View style={styles.chipRow}>
              {Object.entries(q.summary.counts).map(([option, count]) => (
                <Chip key={option} label={`${option}: ${count}`} />
              ))}
            </View>
          );
        } else if ('average' in q.summary) {
          summary = (
            <ThemedText type="small">
              ⌀ {q.summary.average ?? '–'} | min {q.summary.min ?? '–'} | max{' '}
              {q.summary.max ?? '–'}
            </ThemedText>
          );
        } else if ('responses' in q.summary) {
          summary = (
            <View style={styles.chipRow}>
              {q.summary.responses.slice(0, 3).map((text, idx) => (
                <Chip key={idx} label={text || '—'} />
              ))}
              {q.summary.responses.length > 3 && (
                <Chip label={`+${q.summary.responses.length - 3} mehr`} />
              )}
            </View>
          );
        }
        return (
          <View key={q.questionId} style={{ gap: Spacing.half }}>
            <ThemedText type="smallBold">{q.prompt}</ThemedText>
            {summary}
          </View>
        );
      })}
    </View>
  );
};

const Chip = ({ label }: { label: string }) => (
  <ThemedView style={styles.chip} type="backgroundSelected">
    <ThemedText type="small">{label}</ThemedText>
  </ThemedView>
);

const PrimaryButton = ({
  label,
  onPress
}: {
  label: string;
  onPress: () => void | Promise<void>;
}) => (
  <ThemedView style={styles.buttonPrimary} type="backgroundSelected">
    <ThemedText onPress={onPress} style={styles.buttonText}>
      {label}
    </ThemedText>
  </ThemedView>
);

const SecondaryButton = ({
  label,
  onPress
}: {
  label: string;
  onPress: () => void | Promise<void>;
}) => (
  <ThemedView style={styles.buttonSecondary} type="backgroundElement">
    <ThemedText onPress={onPress} style={styles.buttonText}>
      {label}
    </ThemedText>
  </ThemedView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.three
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three
  },
  headerButtons: {
    flexDirection: 'row',
    gap: Spacing.two
  },
  messageBox: {
    padding: Spacing.two,
    borderRadius: Spacing.two
  },
  loader: {
    alignItems: 'center',
    marginVertical: Spacing.three
  },
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    marginBottom: Spacing.three,
    gap: Spacing.one
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one
  },
  chip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 20
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
    flexWrap: 'wrap'
  },
  surveyBox: {
    padding: Spacing.two,
    borderRadius: Spacing.two,
    gap: Spacing.one
  },
  buttonPrimary: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two
  },
  buttonSecondary: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
    opacity: 0.9
  },
  buttonText: {
    fontWeight: '600'
  }
});
