import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendlyWidgetComponent } from '../../components/calendly-widget/calendly-widget.component';
import { CalendarService } from '../../services/calendar.service';
import { MeetingType } from '../../models/calendar.model';

@Component({
  selector: 'app-agendar',
  standalone: true,
  imports: [CommonModule, CalendlyWidgetComponent],
  templateUrl: './agendar.component.html',
  styleUrls: ['./agendar.component.css']
})
export class AgendarComponent implements OnInit {
  meetingTypes: MeetingType[] = [];
  selectedMeetingType: string = '';
  showWidget = false;
  showModal = false;

  constructor(private calendarService: CalendarService) {}

  ngOnInit(): void {
    this.meetingTypes = this.calendarService.getMeetingTypes();
  }

  selectMeetingType(meetingType: string): void {
    this.selectedMeetingType = meetingType;
    this.showWidget = true;
    this.showModal = true;
  }

  onBookingCompleted(event: any): void {
    console.log('Booking completed:', event);
    this.showModal = false;
    this.showWidget = false;
    
    // Aquí podrías mostrar un mensaje de confirmación
    // o redirigir a una página de agradecimiento
  }

  onWidgetClosed(): void {
    this.showModal = false;
    this.showWidget = false;
  }

  getIconColor(color: string): string {
    const colors: Record<string, string> = {
      blue: '#3b82f6',
      green: '#10b981',
      purple: '#8b5cf6',
      indigo: '#6366f1',
      red: '#ef4444',
      yellow: '#f59e0b'
    };
    return colors[color] || '#6b7280';
  }

  getBgColor(color: string): string {
    const colors: Record<string, string> = {
      blue: 'bg-blue-50 border-blue-200',
      green: 'bg-green-50 border-green-200',
      purple: 'bg-purple-50 border-purple-200',
      indigo: 'bg-indigo-50 border-indigo-200',
      red: 'bg-red-50 border-red-200',
      yellow: 'bg-yellow-50 border-yellow-200'
    };
    return colors[color] || 'bg-gray-50 border-gray-200';
  }

  getTextColor(color: string): string {
    const colors: Record<string, string> = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      indigo: 'text-indigo-600',
      red: 'text-red-600',
      yellow: 'text-yellow-600'
    };
    return colors[color] || 'text-gray-600';
  }
}
