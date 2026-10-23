import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Menu, Provider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import data from './data/data';
import BackButton from "@/components/BackButton";
import { RFValue } from "react-native-responsive-fontsize";

const TIME_MAP: Record<string, { start: string; end: string }> = {
  '1m': { start: '07:00', end: '07:45' },
  '2m': { start: '07:45', end: '08:30' },
  '3m': { start: '08:30', end: '09:15' },
  '4m': { start: '09:15', end: '10:00' },
  '5m': { start: '10:20', end: '11:05' },
  '6m': { start: '11:05', end: '11:50' },
  '1t': { start: '12:50', end: '13:35' },
  '2t': { start: '13:35', end: '14:20' },
  '3t': { start: '14:20', end: '15:05' },
  '4t': { start: '15:25', end: '16:10' },
  '5t': { start: '16:10', end: '16:55' },
  '6t': { start: '16:55', end: '17:40' },
  '1madm': { start: '07:00', end: '08:00' },
  '2madm': { start: '08:00', end: '09:00' },
  '3madm': { start: '09:00', end: '10:00' },
  '4madm': { start: '10:00', end: '11:00' },
  '5madm': { start: '11:00', end: '12:00' },
  '1tadm': { start: '13:00', end: '14:00' },
  '2tadm': { start: '14:00', end: '15:00' },
  '3tadm': { start: '15:00', end: '16:00' },
  '4tadm': { start: '16:00', end: '17:00' },
  '5tadm': { start: '17:00', end: '18:00' },
  '3me': { start: '08:30', end: '11:50' },
  '1me': { start: '07:00', end: '10:00' },
  '1te': { start: '12:50', end: '16:10' },
  '3te': { start: '14:20', end: '17:40' },
};

const Aulas = () => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);

  // Salvar seleção no AsyncStorage
  const saveSelection = async (course: string, period: string, day: string) => {
    try {
      await AsyncStorage.setItem('selectedCourse', course);
      await AsyncStorage.setItem('selectedPeriod', period);
      await AsyncStorage.setItem('selectedDay', day);
    } catch (error) {
      console.error('Erro ao salvar seleção:', error);
    }
  };

  // Carregar seleção do AsyncStorage
  const loadSelection = async () => {
    try {
      const course = await AsyncStorage.getItem('selectedCourse');
      const period = await AsyncStorage.getItem('selectedPeriod');
      const day = await AsyncStorage.getItem('selectedDay');

      if (course) setSelectedCourse(course);
      if (period) setSelectedPeriod(period);
      if (day) setSelectedDay(day);

      if (course && period && day) {
        loadSchedule(course, period, day);
        loadAvailablePeriods(course);
      }
    } catch (error) {
      console.error('Erro ao carregar seleção:', error);
    }
  };

  useEffect(() => {
    loadSelection(); // Recuperar seleção salva ao abrir a tela
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadAvailablePeriods(selectedCourse);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedCourse && selectedPeriod && selectedDay) {
      loadSchedule(selectedCourse, selectedPeriod, selectedDay);
      saveSelection(selectedCourse, selectedPeriod, selectedDay);
    }
  }, [selectedCourse, selectedPeriod, selectedDay]);

  const loadSchedule = (course: string, period: string, day: string) => {
    try {
      const courseData = data[course.toLowerCase()];
      const filtered = courseData?.[period]?.[day.toLowerCase()] || [];
      setSchedule(filtered);
    } catch (error) {
      console.error('Erro ao carregar o horário:', error);
    }
  };

  const loadAvailablePeriods = (course: string) => {
    try {
      const courseData = data[course.toLowerCase()];
      if (courseData) {
        setAvailablePeriods(Object.keys(courseData));
      }
    } catch (error) {
      console.error('Erro ao carregar períodos:', error);
    }
  };

  const renderCourseMenu = () => (
    <View style={styles.selectionContainer}>
      <Text style={styles.courseText}>Curso:</Text>
      <Menu
        visible={isCourseDropdownOpen}
        onDismiss={() => setIsCourseDropdownOpen(false)}
        anchor={
          <TouchableOpacity
            style={styles.selectionButton}
            onPress={() => setIsCourseDropdownOpen(true)}
          >
            <Text style={styles.selectionText}>{selectedCourse || "Selecione"}</Text>
          </TouchableOpacity>

        }
      >
        {['IPI', 'TSI', 'LOG', 'ADM', 'TGQ'].map((course) => (
          <Menu.Item
            key={course}
            onPress={() => {
              setSelectedCourse(course);
              setSelectedPeriod(null); // Resetar o período ao trocar de curso
              setSelectedDay(null); // Resetar o dia ao trocar de curso
              setSchedule([]); // Limpar a grade de horários
              setIsCourseDropdownOpen(false);
            }}

            title={course}
            style={{
              backgroundColor: '#2A5224', // Cor de fundo personalizada
              borderBottomWidth: 1, // Adiciona uma linha divisória (opcional)
              borderBottomColor: '#FFFFFF', // Cor da linha divisória
            }}
            titleStyle={{
              color: '#FFFFFF', // Cor do texto
              fontSize: 16, // Tamanho da fonte
              fontWeight: 'bold', // Negrito
            }}
          />
        ))}
      </Menu>
    </View>
  );

  const renderPeriodMenu = () => (
    <View style={styles.selectionContainer}>
      <Text style={styles.periodText}>Período:</Text>
      <Menu
        visible={isPeriodDropdownOpen}
        onDismiss={() => setIsPeriodDropdownOpen(false)}
        anchor={
          <TouchableOpacity
            style={styles.selectionButton}
            onPress={() => setIsPeriodDropdownOpen(true)}
            disabled={!selectedCourse}
          >
            <Text style={[styles.selectionText, !selectedCourse && { opacity: 0.5 }]}>
              {selectedPeriod || "Selecione"}
            </Text>
          </TouchableOpacity>
        }
      >
        {availablePeriods.map((period) => (
          <Menu.Item
            key={period}
            onPress={() => {
              setSelectedPeriod(period);
              setIsPeriodDropdownOpen(false);
            }}
            title={`${period} Período`}
            style={{
              backgroundColor: '#2A5224', // Cor de fundo personalizada
              borderBottomWidth: 1, // Linha divisória entre os itens (opcional)
              borderBottomColor: '#FFFFFF', // Cor da linha divisória
            }}
            titleStyle={{
              color: '#FFFFFF', // Cor do texto
              fontSize: 16, // Tamanho da fonte
              fontWeight: 'bold', // Negrito
            }}
          />
        ))}
      </Menu>

    </View>
  );

  const renderDayButton = (day: string) => (
    <TouchableOpacity
      key={day}
      style={[styles.dayButton, { backgroundColor: selectedDay === day ? '#92C36B' : '#DEFCC7' }]}
      onPress={() => setSelectedDay(day)}
    >
      <Text style={[styles.dayText, { color: selectedDay === day ? '#000' : '#000' }]}>{day}</Text>
    </TouchableOpacity>
  );

  return (
    <Provider>
      <View style={styles.container}>
        <BackButton />
        <Text style={styles.title}>Horários das Aulas 2026.2</Text>
        <View style={styles.separator} />

        {/* Seleção de Curso (Dropdown) */}
        <View style={styles.selectionContainer}>
          {renderCourseMenu()}

          {/* Espaço entre o Curso e o Período */}
          {/* <View style={{ marginRight: '5%' }} /> */}

          {/* Seleção de Período (Dropdown) */}
          {renderPeriodMenu()}
        </View>

        <View style={styles.container2}>
          {selectedCourse && selectedPeriod && (
            <View>
              <Text style={styles.selectedInfo}>
                Horário de {selectedCourse} - {selectedPeriod} Período
              </Text>
              <View style={styles.separator4}></View>
            </View>
          )}


          {/* Seleção de Dias */}
          {selectedPeriod && (
            <View style={styles.daysContainer}>
              {['seg', 'ter', 'qua', 'qui', 'sex'].map((day) => renderDayButton(day))}
            </View>
          )}

          {/* Exibindo os retângulos "Horários" e "Disciplinas" quando um dia for selecionado */}
          {selectedDay && (
            <View style={styles.rectanglesContainer}>
              <View style={styles.rectangle}>
                <Text style={styles.rectangleText}>Horas:</Text>
              </View>
              <View style={styles.rectangle1}>
                <Text style={styles.rectangleText}>Disciplinas:</Text>
              </View>
            </View>
          )}

          {/* Quadro de Horário */}
          <FlatList
            data={schedule}
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={<Text style={styles.noScheduleText}>Selecione o curso e período para ver a grade de horário.{"\n"}  {"\n"}OBS: Se ao selecionar seu período os horários não aparecerem, significa que não há aulas para o dia escolhido.</Text>}
            renderItem={({ item }) => {
              const time = TIME_MAP[item.time] || { start: '--:--', end: '--:--' };
              return (
                <View style={styles.scheduleItem}>
                  <View style={styles.time}>
                    <Text style={styles.timet}>{time.start}</Text>
                    <View style={styles.separator3}></View>
                    <Text style={styles.timet}>{time.end}</Text>
                  </View>
                  <View style={styles.subjectContainer}>
                    <Text style={styles.subject}>{item.subject}</Text>
                    <View style={styles.separator2}></View>
                    <Text style={styles.teacher}>{item.teacher}</Text>
                  </View>
                </View>
              );
            }}
          />
        </View>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: "6%",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: "4%",
  },
  container2: {
    paddingVertical: "4%",
    backgroundColor: "#2A5224",
    paddingHorizontal: "4%",
    borderRadius: 20,
  },
  separator: {
    width: "100%",
    height: 2,
    backgroundColor: "#000",
    alignSelf: 'center',
  },
  separator2: {
    width: "90%",
    height: 2,
    backgroundColor: "#fff",
    alignSelf: 'center',
    marginVertical: 10
  },
  separator3: {
    width: "20%",
    height: 2,
    backgroundColor: "#000",
    alignSelf: 'center',
    marginVertical: 5
  },
  separator4: {
    width: "90%",
    height: 2,
    backgroundColor: "#fff",
    alignSelf: 'center',
    marginBottom: 14
  },
  title: {
    fontSize: RFValue(20),
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
    marginBottom: 10,
    marginTop: "10%",
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: RFValue(8),
    alignSelf: 'center',
  },
  dayButton: {
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    height: RFValue(30),
    borderRadius: 5,
  },
  dayText: {
    textAlign: 'center',
    fontSize: RFValue(14),
    lineHeight: RFValue(20),
    fontWeight: 'normal',
  },
  rectanglesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: RFValue(10),
  },
  rectangle: {
    backgroundColor: '#92C36B',
    borderRadius: 8,
    alignItems: 'center',
    width: "22%",
    height: RFValue(30),
    marginRight: 10,
    justifyContent: 'center',
  },
  rectangle1: {
    backgroundColor: '#42860D',
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    height: RFValue(30),
    justifyContent: 'center',
  },
  rectangleText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: RFValue(14),
    textAlign: 'center', // Alinhamento horizontal do texto
  },
  scheduleItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  time: {
    width: "22%",
    height: RFValue(60),
    marginRight: 10,
    fontWeight: 'bold',
    backgroundColor: '#92C36B',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectContainer: {
    flex: 1,
    backgroundColor: '#42860D',
    padding: RFValue(6),
    borderRadius: 8,
    height: RFValue(60),
  },
  subject: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#fff',
    fontSize: RFValue(12),
  },
  teacher: {
    textAlign: 'center',
    color: '#fff',
    fontSize: RFValue(10),
  },
  timet: {
    color: '#000',
    fontSize: RFValue(14),
  },
  noScheduleText: {
    textAlign: 'center',
    color: '#fff',
    fontStyle: 'italic',
  },
  selectionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 5,
    marginTop: 5,
    alignItems: 'center',
    alignSelf: 'center',
  },
  courseText: {
    fontSize: RFValue(14),
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: "#2A5224",
    height: RFValue(30),
    width: RFValue(70),
    borderRadius: 8,
    textAlign: 'center',
    justifyContent: 'center',
    lineHeight: RFValue(25),
  },  
  periodText: {
    fontSize: RFValue(14),
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: "#2A5224",
    height: RFValue(30),
    width: RFValue(70),
    borderRadius: 8,
    textAlign: 'center',
    justifyContent: 'center',
    lineHeight: RFValue(25),
    marginLeft: 10
  },
  optionButtonText: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    color: '#4285F4', // Cor única para todos os cursos
  },
  selectedInfo: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  selectionButton: {
    backgroundColor: "#DEFCC7", // Verde claro
    borderWidth: 2,
    borderColor: "#2A5224", // Verde escuro
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: "center",
    marginLeft: 3
  },
  selectionText: {
    color: "#2A5224", // Verde escuro
    fontWeight: "bold",
    fontSize: RFValue(14),
  },
});

export default Aulas;

