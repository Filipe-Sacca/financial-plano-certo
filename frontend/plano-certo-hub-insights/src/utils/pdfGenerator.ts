
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateReportPDF = async (reportData: any, filename: string) => {
  try {
    // Criar uma nova instância do jsPDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header do relatório
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(reportData.title || 'Relatório', 20, yPosition);
    yPosition += 15;

    // Data de geração
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Gerado em: ${new Date(reportData.generatedAt).toLocaleString('pt-BR')}`, 20, yPosition);
    yPosition += 10;

    // Cliente
    if (reportData.client) {
      pdf.text(`Cliente: ${reportData.client}`, 20, yPosition);
      yPosition += 10;
    }

    // Período
    if (reportData.period) {
      const periodText = `Período: ${new Date(reportData.period.from).toLocaleDateString('pt-BR')} - ${new Date(reportData.period.to).toLocaleDateString('pt-BR')}`;
      pdf.text(periodText, 20, yPosition);
      yPosition += 15;
    }

    // Descrição
    if (reportData.description) {
      pdf.setFontSize(11);
      pdf.text(`Descrição: ${reportData.description}`, 20, yPosition);
      yPosition += 15;
    }

    // Linha separadora
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 15;

    // Função para verificar se precisa de nova página
    const checkNewPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
    };

    // Métricas principais (se existirem)
    if (reportData.data?.summary || reportData.metrics) {
      const metrics = reportData.data?.summary || reportData.metrics;
      
      checkNewPage(60);
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Resumo Executivo', 20, yPosition);
      yPosition += 15;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');

      if (metrics.totalRevenue !== undefined) {
        pdf.text(`Receita Total: R$ ${metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPosition);
        yPosition += 8;
      }

      if (metrics.revenue !== undefined) {
        pdf.text(`Receita: R$ ${metrics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPosition);
        yPosition += 8;
      }

      if (metrics.totalOrders !== undefined) {
        pdf.text(`Total de Pedidos: ${metrics.totalOrders.toLocaleString('pt-BR')}`, 20, yPosition);
        yPosition += 8;
      }

      if (metrics.orders !== undefined) {
        pdf.text(`Pedidos: ${metrics.orders.toLocaleString('pt-BR')}`, 20, yPosition);
        yPosition += 8;
      }

      if (metrics.averageTicket !== undefined) {
        pdf.text(`Ticket Médio: R$ ${metrics.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPosition);
        yPosition += 8;
      }

      if (metrics.netRevenue !== undefined) {
        pdf.text(`Receita Líquida: R$ ${metrics.netRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPosition);
        yPosition += 8;
      }

      if (metrics.totalCommission !== undefined) {
        pdf.text(`Comissões: R$ ${metrics.totalCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPosition);
        yPosition += 8;
      }

      yPosition += 10;
    }

    // Dados de comparação (se existirem)
    if (reportData.data?.changes) {
      const changes = reportData.data.changes;
      
      checkNewPage(40);
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Variação vs Período Anterior', 20, yPosition);
      yPosition += 15;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');

      pdf.text(`Receita: ${changes.revenue >= 0 ? '+' : ''}${changes.revenue.toFixed(1)}%`, 20, yPosition);
      yPosition += 8;

      pdf.text(`Pedidos: ${changes.orders >= 0 ? '+' : ''}${changes.orders.toFixed(1)}%`, 20, yPosition);
      yPosition += 8;

      pdf.text(`Ticket Médio: ${changes.ticket >= 0 ? '+' : ''}${changes.ticket.toFixed(1)}%`, 20, yPosition);
      yPosition += 15;
    }

    // Top performers (benchmark)
    if (reportData.data?.stores) {
      checkNewPage(80);
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Ranking de Lojas', 20, yPosition);
      yPosition += 15;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Pos.', 20, yPosition);
      pdf.text('Loja', 35, yPosition);
      pdf.text('Receita', 100, yPosition);
      pdf.text('Pedidos', 140, yPosition);
      pdf.text('Ticket Médio', 170, yPosition);
      yPosition += 8;

      pdf.setFont('helvetica', 'normal');
      reportData.data.stores.slice(0, 10).forEach((store: any, index: number) => {
        checkNewPage(8);
        
        pdf.text(`${index + 1}°`, 20, yPosition);
        const storeName = store.name.length > 25 ? store.name.substring(0, 25) + '...' : store.name;
        pdf.text(storeName, 35, yPosition);
        pdf.text(`R$ ${store.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 100, yPosition);
        pdf.text(store.orders.toString(), 140, yPosition);
        pdf.text(`R$ ${store.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 170, yPosition);
        yPosition += 6;
      });

      yPosition += 10;
    }

    // Top dias (se existirem)
    if (reportData.data?.topDays) {
      checkNewPage(60);
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Top 5 Dias de Maior Receita', 20, yPosition);
      yPosition += 15;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Data', 20, yPosition);
      pdf.text('Receita', 70, yPosition);
      pdf.text('Pedidos', 120, yPosition);
      pdf.text('Ticket Médio', 150, yPosition);
      yPosition += 8;

      pdf.setFont('helvetica', 'normal');
      reportData.data.topDays.slice(0, 5).forEach((day: any) => {
        checkNewPage(6);
        
        pdf.text(day.date, 20, yPosition);
        pdf.text(`R$ ${day.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 70, yPosition);
        pdf.text(day.orders.toString(), 120, yPosition);
        pdf.text(`R$ ${day.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 150, yPosition);
        yPosition += 6;
      });

      yPosition += 10;
    }

    // Configurações personalizadas
    if (reportData.config) {
      checkNewPage(30);
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Configurações do Relatório', 20, yPosition);
      yPosition += 12;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Agrupamento: ${reportData.config.groupBy}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Ordenação: ${reportData.config.sortBy} (${reportData.config.sortOrder})`, 20, yPosition);
      yPosition += 6;

      if (reportData.filters && reportData.filters.length > 0) {
        pdf.text(`Filtros aplicados: ${reportData.filters.length}`, 20, yPosition);
        yPosition += 10;
      }
    }

    // Footer - usando o método correto para obter número de páginas
    const totalPages = (pdf as any).internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth - 40, pageHeight - 10);
      pdf.text('Gerado pelo iFood Analytics Dashboard', 20, pageHeight - 10);
    }

    // Salvar o PDF
    pdf.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Erro ao gerar o relatório PDF');
  }
};

// Função auxiliar para capturar elementos HTML como imagem (para gráficos)
export const captureElementAsPDF = async (elementId: string, filename: string) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Elemento não encontrado');
    }

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Erro ao capturar elemento:', error);
    throw new Error('Erro ao gerar PDF do elemento');
  }
};
